from dateutil.relativedelta import relativedelta
from configparser import ConfigParser
from threading import Thread
from typing import Literal
import logging as log
import datetime as dt
import requests
import time
import os
from cryptography.fernet import Fernet

from .event import EventHandler
from .consts import *

class AppModel:
  # SINGLETON
  _instance = None
  _events = EventHandler()
  _headers = {}
  _host = 'http://127.0.0.1:8000/api'
  _cfg = ConfigParser()
  _auto_reconnect_active = False
  _check_connection = True
  _user = None

  #-----------------------------------------------------
  # propriedades
  @property
  def events(self): return self._events
  @property
  def hasToken(self): return 'Authorization' in self._headers
  @property
  def user(self) -> dict | None: return self._user
  @property
  def defaultYearMonth(self): return self._default_year_month

  #-----------------------------------------------------
  # métodos públicos
  @classmethod
  def getInstance(cls):
    if cls._instance is None:
      cls._instance = cls()
    return cls._instance

  def initialize(self):
    today = dt.date.today()
    self._default_year_month = (today if today.day <= 10 else today+relativedelta(months=1)).strftime('%Y-%m')
  
    self._events.bind(EVT_CONNECTION_BROKEN, self._api_auto_reconnect)

    if os.path.exists(CFG_FILE):
      with open(CFG_FILE) as f:
        self._cfg.read_file(f)

    # gerando chave de criptografia, caso necessário
    if not self._cfg.has_option('Crypto', 'key'):
      self._update_cfg(Crypto={'key': Fernet.generate_key().decode()})

    self._fernet = Fernet(self._cfg['Crypto']['key'])
    has_connection = self.checkConnection()

    if not has_connection:
      self._events.emit(EVT_CONNECTION_BROKEN)

    return has_connection

  def close(self):
    self._check_connection = False

  def checkCredentials(self) -> bool:
    log.debug('[AppModel] checking credentials...')
    try:
      self._headers['Authorization'] = self._fernet.decrypt(self._cfg['Authorization']['token']).decode()
      log.debug(f'[AppModel] headers found: {self._headers}')
    except KeyError:
      log.debug('[AppModel] no credentials found in cache')
      return False
    
    return self._load_user()

  def authenticate(self, username:str,  password:str, remember:bool):
    log.debug(f'Authentication required with username "{username}"...')
    response = self.request('POST', '/auth', token=False, data={'username': username, 'password': password}, detail_from_response=False)

    if response['success']:
      self._events.emit(EVT_USER_AUTHENTICATED)
      self._headers['Authorization'] = 'Token ' + response['data']['token']
      log.debug(f'Authentication success')

      if remember:
        log.debug(f'holding user credentials in cache (remember=True)')
        token_encrypted = self._fernet.encrypt(self._headers['Authorization'].encode()).decode()
        self._update_cfg(Authorization={'token': token_encrypted})
      else:
        self._update_cfg(Authorization={})

    elif not response['connectionError']:
      response['error'] = 'usuário ou senha incorretos!'

    return response

  def logout(self):
    self._user = None
    self._headers.clear()
    self._update_cfg(Authorization={})
    self._events.emit(EVT_USER_LOGGED_OUT)

  def request(self, method:Literal['GET', 'POST'], endpoint:str, token=True, json_response=True,  detail_from_response=True, **kwargs) -> dict:
    result = {'success': False, 'error': '', 'connectionError': False}
    if token:
      kwargs['headers'] = self._headers

    match method:
      case 'GET':   func = requests.get
      case 'POST':  func = requests.post
      case _:       raise ValueError(f'method {method} not available')

    log.debug(f'[AppModel::request] {method=} {endpoint=} {kwargs=}')

    try:
      response = func(self._host+endpoint, **kwargs)
    except requests.ConnectionError as e:
      log.error(f'[AppModel] request error: {e}')
      self._events.emit(EVT_CONNECTION_BROKEN)
      log.debug(f'is was not possible to request {endpoint}')
      result['error'] = 'não foi possível estabelecer uma conexão com o servidor'
      result['connectionError'] = True
      return result

    result['success'] = response.status_code == 200

    if not result['success'] and detail_from_response:
      result['error'] = response.json()['detail']

    if result['success'] and json_response:
      result['data'] = response.json()

    return result

  def checkConnection(self) -> bool:
    try:
      requests.get(self._host)
      return True
    except requests.ConnectionError:
      return False

  #-----------------------------------------------------
  # métodos privados
  def _update_cfg(self, **params):
    self._cfg.update(params)
    with open(CFG_FILE, 'w') as f:
      self._cfg.write(f)

  def _api_auto_reconnect(self):
    if not self._auto_reconnect_active:
      self._auto_reconnect_active = True
      Thread(target=self._api_auto_reconnect_loop).start()

  def _api_auto_reconnect_loop(self):
    log.debug('[AppModel] auto reconnect initialized')
    try_again = True

    while try_again:
      time.sleep(3)
      connected = self.checkConnection()
      try_again = self._check_connection and not connected
      log.debug(f'[AppModel] auto reconnect result: ConnectionSuccess={connected} TryAgain={try_again}')

    self._auto_reconnect_active = False
    if connected:
      self.events.emit(EVT_CONNECTION_RESTORED)

  def _load_user(self) -> bool:
    response = self.request('GET', '/getUser')
    if response['success']:
      log.debug('[AppModel] user data loaded successfully')
      self._user = response['data']
      self._user['fullName'] = f'{self._user['first_name']} {self._user['last_name']}'

      # padronizando com interface do typescript
      self._user['firstName'] = self._user.pop('first_name')
      self._user['lastName'] = self._user.pop('last_name')

    else:
      log.debug(f'[AppModel] it was not possible to extract the user data, {response=}')

    return response['success']
  
  #-----------------------------------------------------
