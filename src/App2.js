import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import {firestore ,Kpp} from './firebase.js';


const app=Kpp;
const db=firestore;


// Default data
const defaultData = {
  message: "Hello, World!"
};

function MessageApp() {
  const [message, setMessage] = useState("");

  // Fetch initial data from Firebase
  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, 'messages', 'messageDoc'); // Specify your document path
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log(data.message);
        console.log(data.message);
        setMessage(data.message || defaultData.message);
      } else {
        // If the document does not exist, create it with default data
        await setDoc(docRef, defaultData);
        setMessage(defaultData.message);
      }
    };
    fetchData();
  }, []);

  // Update message in Firestore when changed
  const handleUpdateMessage = async () => {
    // const docRef = doc(db, 'messages'); // Specify your document path
    // await setDoc(docRef, { message }, { merge: true });
    // const[ docRef]=useRef(message);
    console.log(message);

  };

  return (
    <div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onBlur={handleUpdateMessage} // Update Firestore on input blur
      />
      <button onClick={handleUpdateMessage}>save</button>
    </div>
  );
}

export default MessageApp;
