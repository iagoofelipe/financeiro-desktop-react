import time

from backend.model.appmodel import AppModel
from backend.model.consts import *

class JavaScriptAPI:
  def __init__(self):
    self._authenticated = False
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
  def getCards(self): return self._model.request('GET', '/getCards')

  def getRegistries(self, params):
    if 'yearMonth' in params:
      params['date_ref'] = params.pop('yearMonth')+'-01'
    if 'cardId' in params:
      params['card_id'] = params.pop('cardId')
    return self._model.request('GET', '/getRegistries', params=params)

  def getBalance(self, params):
    if 'yearMonth' in params:
      params['date_ref'] = params.pop('yearMonth')+'-01'
    return self._model.request('GET', '/balance', params=params)

  def getSuggestionCategories(self):
    return self._model.request('GET', '/getSuggestionCategories')
  
  #-----------------------------------------------------
  # eventos
  def on_model_userAuthenticated(self):
    self._authenticated = True

  def on_model_userLoggedOut(self):
    self._authenticated = False
  
  #-----------------------------------------------------