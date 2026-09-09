import time
import webview

class ServerAPI:
  def __init__(self):
    self._authenticated = False
    self._server_available = True

  def setWindow(self, win:webview.Window):
    self._win = win

  def authenticate(self, data) -> bool:
    time.sleep(1)
    return data['username'] == 'iago' and data['password'] == '1234'

  def isAuthenticated(self) -> bool: return self._authenticated

  def isServerAvailable(self) -> bool: return self._server_available

  def createAccount(self, data) -> tuple[bool, str]:
    time.sleep(1)
    if data['username'] == 'iago':
      return dict(success=False, error='já existe um usuário com essas informações!')
    else:
      return dict(success=True, error='')

  def changePage(self, endpoint):
    self._win.evaluate_js(f'window.location.href = "#{endpoint}"')