import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut, signInWithRedirect } from 'firebase/auth';
import { firestore, auth,firebaseConfig} from "./firebase.js";
import EditableText from './widgets/EditableText.js';

// import {firebase} from "firebase";

// Firebase app initialization
const app = initializeApp(firebaseConfig);
const db = firestore;
// const provider = new GoogleAuthProvider();

const defaultData = { kudaList: [{ title: "Default Title", countTotal: 0, names: [] }], message: "" };

function App() {
  const [kudaList, setKudaList] = useState([]);
  const [syncStatus, setSyncStatus] = useState(false);
  const [message, setMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });
    return unsubscribe;
  }, []);

  // Optimized fetchData to handle async operations properly
  const fetchData = useCallback(async (userId) => {
    const docRef = doc(db, "users", userId, "data", "tasks");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      setKudaList(data.kudaList || defaultData.kudaList);
      setMessage(data.message || defaultData.message);
    } else {
      await setDoc(docRef, defaultData);
      setKudaList(defaultData.kudaList);
      setMessage(defaultData.message);
    }
  }, [db]);

  useEffect(() => {
    if (currentUser) {
      fetchData(currentUser.uid);
    }
  }, [currentUser, fetchData]);

  // Add new Kuda with async batching
  const addKuda = async () => {
    const newKuda = { title: "New Detail", countTotal: 0, names: [] };
    const updatedKudaList = [...kudaList, newKuda];
    setKudaList(updatedKudaList);

    if (currentUser) {
      const docRef = doc(db, "users", currentUser.uid, "data", "tasks");
      await setDoc(docRef, { kudaList: updatedKudaList, message });
      setSyncStatus(true);
      setTimeout(() => setSyncStatus(false), 2000);  // Async UI update
    }
  };

  // Delete Kuda
  const deleteKuda = async (index) => {
    const updatedKudaList = kudaList.filter((_, i) => i !== index);
    setKudaList(updatedKudaList);

    if (currentUser) {
      const docRef = doc(db, "users", currentUser.uid, "data", "tasks");
      await setDoc(docRef, { kudaList: updatedKudaList, message });
    }
  };

  // Update Kuda data in Firebase
  const updateKudaInFirebase = async (index, updatedKuda) => {
    const updatedKudaList = [...kudaList];
    updatedKudaList[index] = updatedKuda;
    setKudaList(updatedKudaList);

    if (currentUser) {
      const docRef = doc(db, "users", currentUser.uid, "data", "tasks");
      await setDoc(docRef, { kudaList: updatedKudaList, message });
    }
  };

  // Google Sign-In handler
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      const user = result.user;
      console.log("Signed in user:", user);
      // You can update state after sign-in if you want to display user info
      setCurrentUser(user);
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      const email = error.customData.email;
      const credential = GoogleAuthProvider.credentialFromError(error);
      console.error("Error signing in with Google:", error);
    }
  };

  // Google Sign-Out handler
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
    } catch (error) {
      console.error("Sign-out error", error);
    }
  };

  return (
    <div className="App" style={styles.app}>
      <header style={styles.header}>
        {!currentUser ? (
          <button onClick={handleGoogleSignIn}>Sign in with Google</button>
        ) : (
          <>
            <button onClick={handleSignOut}>Sign out</button>
            {kudaList.map((kuda, index) => (
              <Kuda
                key={index}
                index={index}
                kuda={kuda}
                updateKuda={(updatedKuda) => updateKudaInFirebase(index, updatedKuda)}
                deleteKuda={() => deleteKuda(index)}
              />
            ))}
            <button onClick={addKuda}>Add Details</button>
            <div style={styles.label}>
              {message} {syncStatus && <span>✅</span>}
            </div>
          </>
        )}
      </header>
    </div>
  );
}

function Kuda({ kuda, updateKuda, deleteKuda }) {
  const { title = "New Detail", names = [] } = kuda;
  const [countCheck, setCountCheck] = useState(0);
  const [countPercent, setCountPercent] = useState(0);
  const [total, setTotal] = useState(names.length);

  useEffect(() => {
    setCountPercent(total > 0 ? (countCheck / total) * 100 : 0);
  }, [countCheck, total]);

  const handleCheckboxChange = (isChecked, index) => {
    if (isChecked) {
      setCountCheck((prev) => prev + 1);
    } else {
      setCountCheck((prev) => prev - 1);
    }
  };

  const addSlice = () => {
    const newNames = [...names, "New Slice"];
    updateKuda({ ...kuda, names: newNames });
    setTotal(total + 1);
  };

  const deleteSlice = (index) => {
    const newNames = names.filter((_, i) => i !== index);
    updateKuda({ ...kuda, names: newNames });
    setTotal(total - 1);
    setCountCheck((prev) => Math.max(prev - 1, 0)); // Decrement countCheck, but not below 0
  };

  const resetNames = () => {
    updateKuda({ ...kuda, names: [], countTotal: 0 });
  };

  const handleTitleChange = (newTitle) => {
    updateKuda({ ...kuda, title: newTitle });
  };

 

  return (
    <details style={styles.details}>
      <summary>
        <EditableText text={title} onTextChange={handleTitleChange} />
        {countPercent.toFixed(2)}% {"[" + countCheck + "/" + total + "]"}
        <button onClick={deleteKuda} style={styles.deleteButton}>Delete Detail</button>
      </summary>
      {names.map((name, i) => (
        <Slice
          key={i}
          text={name}
          onChange={handleCheckboxChange}
          onTextChange={(newName) => {
            const newNames = [...names];
            newNames[i] = newName;
            updateKuda({ ...kuda, names: newNames });
          }}
          onDelete={() => deleteSlice(i)}
        />
      ))}
      <button onClick={addSlice}>Add Slice</button>
      <button onClick={resetNames}>Reset Names</button>
    </details>
  );
}

function Slice({ text, onChange, onTextChange, onDelete }) {
  const [checked, setChecked] = useState(false);

  const handleChange = () => {
    setChecked((prev) => !prev);
    onChange(!checked);
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 2fr 1fr',
      gap: '10px',
      alignItems: 'center',
      padding: '8px',
      border: '1px solid #ccc',
      borderRadius: '5px',
      boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    }}>
      <input type="checkbox" checked={checked} onChange={handleChange} />
      <EditableText text={text} onTextChange={onTextChange} />
      <button onClick={onDelete} style={{ backgroundColor: 'red', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px' }}>
        Delete
      </button>
    </div>
  );
}

const EditableSingleText = ({ text, onTextChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(text);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onTextChange(value);
  };

  return (
    <div onClick={handleDoubleClick} style={{ cursor: 'pointer' }}>
      {isEditing ? (
        <input
          type="text"
          value={value} 
          onChange={handleChange}
          onBlur={handleBlur}
          autoFocus
        />
      ) : (
        <span style={{ padding: '5px' }}>
          
        </span>
      )}
    </div>
  );
};

const styles = {
  app: { fontFamily: 'sans-serif', padding: '20px' },
  header: { textAlign: 'center' },
  label: { fontWeight: 'bold' },
  deleteButton: { marginLeft: '10px' },
  details: { margin: '20px 0' },
  slice: { display: 'flex', alignItems: 'center', marginBottom: '10px' },
};

export default App;
