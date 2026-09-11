import webview
import json

from .jsapi import JavaScriptAPI

class AppView:
  def __init__(self):
    self._js_api = JavaScriptAPI()
    self._window = webview.create_window(
      'Financeiro',
      'http://localhost:5173',
      js_api=self._js_api,
      width=1400,
      height=850
    )

  #-----------------------------------------------------
  # propriedades
  @property
  def window(self): return self._window

  #-----------------------------------------------------
  # métodos públicos
  def emitEvent(self, evt:str, detail:dict=None):
    if detail is None:
      self._window.evaluate_js(f'window.dispatchEvent(new Event("{evt}"))')
    else:
      self._window.evaluate_js('window.dispatchEvent(new CustomEvent("%s", {detail: %s}))' % (evt, json.dumps(detail)))

  def changePage(self, endpoint:str, data:dict=None):
      # self._win.evaluate_js(f'globalThis.changePageData = {'undefined' if data is None else json.dumps(data)}')
      self._window.evaluate_js(f'window.location.href = "#{endpoint}"')

  #-----------------------------------------------------