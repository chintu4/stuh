import React, { useState } from 'react';
import { GoogleLogin } from 'react-google-login';

const Login = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const responseGoogle = (response) => {
    console.log(response);
    setEmail(response.profileObj.email);
    setName(response.profileObj.name);
  };

  return (
    <div>
      <GoogleLogin
        clientId="658977310677-knrl3gka66fldh83dao7rhfbvqvk35hf.apps.googleusercontent.com"
        buttonText="Login"
        onSuccess={responseGoogle}
        onFailure={responseGoogle}
        cookiePolicy={'single_host_origin'}
      />
      {email && <p>Welcome {name} ({email})</p>}
    </div>
  );
};

export default Login;
