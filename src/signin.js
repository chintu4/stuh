import React, { useEffect, useState } from "react";
import {auth} from "./firebase";
import { signInWithPopup } from "firebase/auth";
import { provider } from './firebase';


function SignIn(){
    var [value, setValue] = useState(null);
    const handleClick=()=>{
        signInWithPopup(auth,provider).then(
            (data)=>{
                setValue(data.user.email);
                localStorage.setItem("email",data.user.email)
            }
        )
    }
        useEffect(()=>{
            setValue(localStorage.getItem("email"))
        },[])
    
    return(
        <div>
{value?`Signed in as ${value}`:null}
<button onClick={handleClick}>Sign in with Google</button>
        </div>
    )
}

export default SignIn;