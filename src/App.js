import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore, Kpp, auth } from "./firebase.js";
import SignIn from './signin.js';
import EditableText from './widgets/EditableText.js';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// Initialize Firebase and Firestore
const app = Kpp;
const db = firestore;

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

  useEffect(() => {
    if (currentUser) {
      const fetchData = async () => {
        const userId = currentUser.uid;
        const docRef = doc(db, "users", userId, "data", "tasks"); // Modified to ensure an even number of segments
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
      };
      fetchData();
    }
  }, [currentUser]);

  const addKuda = async () => {
    const newKuda = { title: "New Detail", countTotal: 0, names: [] };
    const updatedKudaList = [...kudaList, newKuda];
    setKudaList(updatedKudaList);

    if (currentUser) {
      const docRef = doc(db, "users", currentUser.uid, "data", "tasks");
      await setDoc(docRef, { kudaList: updatedKudaList, message });
      setSyncStatus(true);
      setTimeout(() => setSyncStatus(false), 2000);
    }
  };

  const deleteKuda = async (index) => {
    const updatedKudaList = kudaList.filter((_, i) => i !== index);
    setKudaList(updatedKudaList);

    const docRef = doc(db, "users", currentUser.uid, "data", "tasks");
    await setDoc(docRef, { kudaList: updatedKudaList, message });
  };

  const updateKudaInFirebase = async (index, updatedKuda) => {
    const updatedKudaList = [...kudaList];
    updatedKudaList[index] = updatedKuda;
    setKudaList(updatedKudaList);

    const docRef = doc(db, "users", currentUser.uid, "data", "tasks");
    await setDoc(docRef, { kudaList: updatedKudaList, message });
  };

  return (
    <div className="App" style={styles.app}>
      <header style={styles.header}>
        <SignIn />
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
      </header>
    </div>
  );
}

function Kuda({ kuda, updateKuda, deleteKuda }) {
  const { title = "New Detail", countTotal, names = [] } = kuda;
  const [countCheck, setCountCheck] = useState(0);
  const [countPercent, setCountPercent] = useState(0);

  useEffect(() => {
    setCountPercent((countCheck / countTotal) * 100);
  }, [countCheck, countTotal]);

  const handleCheckboxChange = (isChecked) => {
    setCountCheck((prev) => (isChecked ? prev + 1 : prev - 1));
  };

  const addSlice = () => {
    const newNames = [...names, "New Slice"];
    updateKuda({ ...kuda, names: newNames, countTotal: countTotal + 1 });
  };

  const deleteSlice = (index) => {
    const newNames = names.filter((_, i) => i !== index);
    updateKuda({ ...kuda, names: newNames });
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
        <EditableSingleText text={title} onTextChange={handleTitleChange} />
        {countPercent.toFixed(2)}% {"[" + countCheck + "/" + countTotal + "]"}
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
    <div style={styles.slice}>
      <input type="checkbox" checked={checked} onChange={handleChange} />
      <EditableText text={text} onTextChange={onTextChange} />
      <button onClick={onDelete}>Delete</button>
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
    <div onClick={handleDoubleClick}>
      {isEditing ? (
        <input type="text" value={value} onChange={handleChange} onBlur={handleBlur} autoFocus />
      ) : (
        <span>{value}</span>
      )}
    </div>
  );
};

const styles = {
  app: {
    fontFamily: "Arial, sans-serif",
    textAlign: "center",
    color: "#333",
  },
  header: {
    backgroundColor: "#282c34",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
  },
  label: {
    fontSize: "24px",
    margin: "20px",
    cursor: "pointer",
  },
  details: {
    margin: "10px",
    padding: "5px",
    backgroundColor: "#444",
    color: "white",
    borderRadius: "5px",
  },
  slice: {
    display: "flex",
    alignItems: "center",
    margin: "5px 0",
  },
  deleteButton: {
    marginLeft: "10px",
    backgroundColor: "red",
    color: "white",
    border: "none",
    padding: "5px",
    borderRadius: "3px",
    cursor: "pointer",
  },
};

export default App;
