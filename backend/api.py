import time

class Api:
    def authenticate(self, data) -> bool:
        print(data)
        time.sleep(3)
        return data['username'] == 'iago' and data['password'] == '1234'