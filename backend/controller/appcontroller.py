from backend.model.appmodel import AppModel
from backend.view.appview import AppView
from backend.model.consts import EVT_CONNECTION_RESTORED, EVT_CONNECTION_BROKEN

class AppController:
  def __init__(self, view:AppView):
    self._model = AppModel.getInstance()
    self._view = view

    self._view.window.events.closed += self._model.close
    self._model.events.bind(EVT_CONNECTION_BROKEN, self.on_model_connectionBroken)
    self._model.events.bind(EVT_CONNECTION_RESTORED, self.on_model_connectionRestored)

  #-----------------------------------------------------
  # métodos públicos
  def initialize(self):
    if not self._model.initialize():
      self._view.changePage('/error')
    elif self._model.checkCredentials():
      self._view.changePage('/home')
    else:
      self._view.changePage('/login')

  #-----------------------------------------------------
  # eventos
  def on_model_connectionBroken(self):
    self._view.emitEvent('connection-broken')

  def on_model_connectionRestored(self):
    if not self._model.hasToken: # usuário não autenticado
      self._view.changePage('/home' if self._model.checkCredentials() else '/login')
    
    self._view.emitEvent('connection-restored', {'authenticationRequired': not self._model.hasToken})

  #-----------------------------------------------------