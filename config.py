db_name     = 'medturk'
server_name = 'localhost'
port 		= 27017

# If file my_config.py is present, then you can can override these values
try:
    from my_config import *
except:
    pass