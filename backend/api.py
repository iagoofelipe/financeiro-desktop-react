import time

class Api:
  def authenticate(self, data) -> bool:
    print('authenticate', data)
    time.sleep(1)
    return data['username'] == 'iago' and data['password'] == '1234'

  def createAccount(self, data) -> tuple[bool, str]:
    print('createAccount', data)
    time.sleep(1)
    if data['username'] == 'iago':
      return dict(success=False, error='já existe um usuário com essas informações!')
    else:
      return dict(success=True, error='')
