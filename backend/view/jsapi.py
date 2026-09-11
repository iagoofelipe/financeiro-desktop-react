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

  def createAccount(self, data) -> tuple[bool, str]:
    time.sleep(1)
    if data['username'] == 'iago':
      return dict(success=False, error='já existe um usuário com essas informações!')
    else:
      return dict(success=True, error='')

  def getUser(self): return self._model.user
  def getDefaultYearMonth(self): return self._model.defaultYearMonth
  
  #-----------------------------------------------------
  # eventos
  def on_model_userAuthenticated(self):
    self._authenticated = True

  def on_model_userLoggedOut(self):
    self._authenticated = False
  
  #-----------------------------------------------------