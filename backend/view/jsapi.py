import logging as log

from backend.model.appmodel import AppModel
from backend.model.consts import *

class JavaScriptAPI:
  def __init__(self):
    self._authenticated = False
    self._cache = {}
    self._model = AppModel.getInstance()

    self._model.events.bind(EVT_USER_AUTHENTICATED, self.on_model_userAuthenticated)
    self._model.events.bind(EVT_USER_LOGGED_OUT, self.on_model_userLoggedOut)

    # métodos de acesso direto entre a api e o model
    self.authenticate = self._model.authenticate
    self.logout = self._model.logout

  #-----------------------------------------------------
  # métodos públicos
  def isAuthenticated(self) -> bool: return self._authenticated

  def createAccount(self, data):
    data['first_name'] = data.pop('firstName')
    data['last_name'] = data.pop('lastName')
    return self._model.request('POST', '/createAccount', token=False, json_response=False, json=data)

  def getUser(self): return self._model.user
  def getDefaultYearMonth(self): return self._model.defaultYearMonth

  def getCards(self):
    # return self._model.request(method='GET', endpoint='/getCards')
    return self._save_cache(endpoint='/getCards')

  def getRegistries(self, params):
    if 'yearMonth' in params:
      params['date_ref'] = params.pop('yearMonth')+'-01'
    if 'cardId' in params:
      params['card_id'] = params.pop('cardId')
    return self._save_cache('/getRegistries', params=params)

  def getBalance(self, params):
    if 'yearMonth' in params:
      params['date_ref'] = params.pop('yearMonth')+'-01'
    return self._save_cache('/balance', params=params)

  def getSuggestionCategories(self):
    return self._save_cache('/getSuggestionCategories')

  def deleteRegistryById(self, id):
    return self._model.request('POST', f'/deleteRegistry/{id}', json_response=False)

  def getResponsables(self):
    return self._save_cache('/getResponsables')

  def clearCache(self):
    self._cache.clear()

  def addRegistry(self, params):
    if 'cardId' in params:
      params['card_id'] = params.pop('cardId')
    if 'responsableId' in params:
      params['responsable_id'] = params.pop('responsableId')
    params['type_in'] = params.pop('typeIn')
    params['installment_current'] = params.pop('currentInstallment')
    params['installment_total'] = params.pop('totalInstallments')
    params['date_ref'] = params.pop('yearMonth')

    self.clearCache()
    return self._model.request('POST', '/addRegistry', json=params)

  #-----------------------------------------------------
  # eventos
  def on_model_userAuthenticated(self):
    self._authenticated = True

  def on_model_userLoggedOut(self):
    self._authenticated = False
    self.clearCache()
  
  #-----------------------------------------------------
  # métodos privados
  def _save_cache(self, endpoint:str, params=None, **kwargs):
    cache_key = (endpoint, *params.keys(), *params.values()) if params else (endpoint, )
    has_cache = cache_key in self._cache
    log.debug(f"cache request <{endpoint=} {params=} {has_cache=}>")
    
    if not has_cache:
      if params:
        kwargs['params'] = params
      self._cache[cache_key] = {
        'response': self._model.request('GET', endpoint, **kwargs),
        'kwargs': kwargs,
      }
    
    return self._cache[cache_key]['response']

  #-----------------------------------------------------
  