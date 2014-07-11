from medturk import config
import pymongo

# Establish connection to database
client = pymongo.MongoClient(config.server_name, config.port)
db     = client[config.db_name]