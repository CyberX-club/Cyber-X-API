from Database.DB import DB
from Database.DbObject import DbObject
from Database.Schema import Schema
from dotenv import load_dotenv
import os 
import json

load_dotenv()

MONGODB_URI = os.environ['MONGODB_URI']

db = DB(uri=MONGODB_URI)

db.set_db(os.environ.get('DB_NAME', 'CyberX'))


if __name__ == '__main__':
    try:
        db.ping()
        print("Connected to the database")
    except Exception as e:
        print("Failed to connect to the database")
        print(e)






