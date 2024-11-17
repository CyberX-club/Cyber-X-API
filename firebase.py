import firebase_admin
from firebase_admin import credentials
from firebase_admin import auth
from Database.DB import DB

class Firebase:
    def __init__(self,db:DB,admin_col="admin"):
        cred = credentials.Certificate("cyberxapi-firebase-adminsdk-5u2p3-2e67a225a7.json")
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




