import firebase_admin
from firebase_admin import credentials
from firebase_admin import auth
from Database.DB import DB
from dotenv import load_dotenv
import os
import json

load_dotenv()

class Firebase:
    def __init__(self,db:DB,admin_col="admin"):

        # Initialize
        FIREBASE_ADMIN_SDK = os.getenv("FIREBASE_ADMIN_SDK")
        JSON_FILE = os.getenv("JSON_FILE","firebase_admin_sdk.json")

        cred = None

        # Create a file called firebase_admin_sdk.json and add the firebase admin sdk json
        if not FIREBASE_ADMIN_SDK:
            raise Exception("Error in loading Firebase Admin SDK")
        
        with open(JSON_FILE,'w') as json_file:
            print(FIREBASE_ADMIN_SDK)
            # data = json.loads(FIREBASE_ADMIN_SDK)
            
            json_file.write(FIREBASE_ADMIN_SDK)



        
        try:
            cred = credentials.Certificate(JSON_FILE)

        except Exception as e:
            raise Exception("Error in loading Firebase Admin SDK")
        
        if not cred:
            raise Exception("Error in loading Firebase Admin SDK")

        # check if firebase is already initialized
        if not firebase_admin._apps:
            firebase_admin.initialize_app(cred)
        self.db = db
        self.admin_col = admin_col

    def check_if_user_exists(self,token):
        # Code to check if user exists in Firebase
        try:
            decoded_token = auth.verify_id_token(token)
            uid = decoded_token['uid']
            user = auth.get_user(uid)
            return True
        except Exception as e:
            return False
        
    def check_if_user_is_admin(self,token):
        # Code to check if user is admin in Firebase
        try:
            decoded_token = auth.verify_id_token(token)
            uid = decoded_token['uid']
            user = auth.get_user(uid)
            email = user.email

            # Code to check if user is admin in db
            self.db.set_collection(self.admin_col)
            obj  = self.db.get_object({"email":email}).compile()
            if obj:
                return True
            else:
                return False


        except Exception as e:
            return False




