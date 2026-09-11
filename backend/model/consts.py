import os as __os # evitando importação com *

CFG_FILE = __os.path.join(__os.environ['TEMP'], 'financeiro.cfg')

EVT_CONNECTION_RESTORED = 'appmodel:connnection-restored'
EVT_CONNECTION_BROKEN = 'appmodel:connection-broken'
EVT_USER_AUTHENTICATED = 'appmodel:user-authenticated'
EVT_USER_LOGGED_OUT = 'appmodel:user-logged-out'