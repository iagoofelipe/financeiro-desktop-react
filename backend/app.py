import webview
import logging as log

from backend.model.appmodel import AppModel
from backend.view.appview import AppView
from backend.controller.appcontroller import AppController

class FinanceiroApp:
  def __init__(self):
    log.basicConfig(level='DEBUG')
    self._model = AppModel.getInstance()
    self._view = AppView()
    self._controller = AppController(self._view)

  def exec(self):
    webview.start(self._controller.initialize, debug=True)
