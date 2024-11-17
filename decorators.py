# decorators.py
from functools import wraps
from flask import request, jsonify, redirect, url_for
from firebase import Firebase
from flask import session  # If you are using sessions, or use `request.headers` if you're using tokens

class Decor:

    def __init__(self,firebase_obj:Firebase):
        self.firebase = firebase_obj
        

    def login_required(self,f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Check if the user is logged in (here, I'm using `session['user']` as an example)
            
            
            
            # Alternatively, if you're using token-based authentication (e.g., JWT):
            token = request.headers.get('Authorization')
            
            if not token:
                return jsonify({"error":"Unauthorized"}),401
            else:
                if not self.firebase.check_if_user_is_admin(token):
                    return jsonify({"error":"Unauthorized"}),401
            
            # If the user is logged in, continue with the route logic
            return f(*args, **kwargs)
        
        return decorated_function
