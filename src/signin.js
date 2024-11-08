// import React, { useEffect, useState } from "react";
// import {auth} from "./firebase";
// import { signInWithPopup } from "firebase/auth";
// import { provider } from './firebase';


// function SignIn(){
//     var [value, setValue] = useState(null);
//     const handleClick=()=>{
//         signInWithPopup(auth,provider).then(
//             (data)=>{
//                 setValue(data.user.email);
//                 localStorage.setItem("email",data.user.email)
//             }
//         )
//     }
//         useEffect(()=>{
//             setValue(localStorage.getItem("email"))
//         },[])
    
//     return(
//         <div>
// {value?`Signed in as ${value}`:null}
// <button onClick={handleClick}>Sign in with Google</button>
//         </div>
//     )
// }

// export default SignIn;

import React, { useState } from 'react';
import { signInWithGoogle ,auth} from './firebase';

function SignInComponent() {
  const [user, setUser] = useState(null);

  
  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      // You can update state after sign-in if you want to display user info
      const currentUser = auth.currentUser;
      setUser(currentUser);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };


  return (
    <div style={style}>
      {!user ? (
        <button onClick={handleSignIn}>Sign In with Google</button>
      ) : (
        <div>
      
          <h3>Welcome, {user.displayName}</h3>
          <img src={user.photoURL} alt="User Avatar" />
          <button onClick={() => {auth.signOut().then(() => window.location.reload());}}>Sign Out</button>
        </div>
      )}
    </div>
  );
}


var style={
    position: 'absolute',
    right: '10px',
    top: '10px',
  };


export default SignInComponent;
