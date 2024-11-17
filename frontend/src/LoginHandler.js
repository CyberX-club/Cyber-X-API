import {auth} from './Firebase';
import {signInWithEmailAndPassword,onAuthStateChanged,GoogleAuthProvider ,signInWithPopup} from "firebase/auth";
import GoogleIcon from '@mui/icons-material/Google';

class LoginHandler
{
  static auth = auth;
  static providers = {
    google: {
      label: "Google",
      icon: (props) => <GoogleIcon {...props} />,
      provider: new GoogleAuthProvider(),
    }
  };

    static loginEmail(email,password)
    {
        console.log("Attempting login for "+email);

        signInWithEmailAndPassword(auth,email,password)
        .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;
            
            console.log("Logged in as "+user.email);
            
          })
          .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
          });
    }

    static onAuthChange(todo)
    {
        onAuthStateChanged(auth, (user) => {
            if (user) {
              // User is signed in, see docs for a list of available properties
              // https://firebase.google.com/docs/reference/js/auth.user
              const uid = user.uid;
              console.log("User is signed in with uid "+uid);
              
              user.getIdToken().then((token) => {
                todo(user,token);
              });

              
              return user

            } else {
              todo(null);
            }
          });
          
    }


    static setInfoOrToken(setInfoDialogData,setToken)
    {
        LoginHandler.onAuthChange((user,rtoken) => {
            if(!user)
                {
                    
                    setInfoDialogData({
                        open: true,
                        title: 'Unauthorized',
                        content: 'You are not authorized to view this page. Please login to view this page.',
                        handleClose: () => {
                            window.location.href = '/login';
                        }
                        });
    
                }
                else
                {
                    setToken(rtoken);
                }
        });
    }

    static loginProvider(provider)
    {
      signInWithPopup(auth, provider)
    .then((result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      // The signed-in user info.
      const user = result.user;
      // IdP data available using getAdditionalUserInfo(result)
      // ...
    }).catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.customData.email;
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);
      // ...
    });
    }
  
}

export default LoginHandler;
