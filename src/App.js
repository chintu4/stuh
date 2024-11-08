import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore, Kpp } from "./firebase.js";
import SignIn from './signin.js';

// Initialize Firebase and Firestore
const app = Kpp;
const db = firestore;

const defaultData = { kudaList: [{ title: "Default Title", countTotal: 1, names: ["Slice", "GATE WAY"] }], message: "" };

function App() {
  const [kudaList, setKudaList] = useState([]);
  const [syncStatus, setSyncStatus] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch initial data from Firebase
  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, "tasks", "taskData");
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
  }, []);

  // Function to handle adding a new Kuda
  const addKuda = async () => {
    const newKuda = { title: "New Detail", countTotal: 1, names: ["Slice", "GATE WAY"] };
    const updatedKudaList = [...kudaList, newKuda];
    setKudaList(updatedKudaList);

    const docRef = doc(db, "tasks", "taskData");
    await setDoc(docRef, { kudaList: updatedKudaList, message });
    setSyncStatus(true);
    setTimeout(() => setSyncStatus(false), 2000);
  };

  // Function to delete a Kuda detail tab
  const deleteKuda = async (index) => {
    const updatedKudaList = kudaList.filter((_, i) => i !== index);
    setKudaList(updatedKudaList);

    const docRef = doc(db, "tasks", "taskData");
    await setDoc(docRef, { kudaList: updatedKudaList, message });
  };

  // Function to update Kuda list in Firebase
  const updateKudaInFirebase = async (index, updatedKuda) => {
    const updatedKudaList = [...kudaList];
    updatedKudaList[index] = updatedKuda;
    setKudaList(updatedKudaList);

    const docRef = doc(db, "tasks", "taskData");
    await setDoc(docRef, { kudaList: updatedKudaList, message });
  };

  return (
    <div className="App" style={styles.app}>
      <header style={styles.header}>
        <SignIn/>
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

// Define Kuda component

function Kuda({ kuda, updateKuda, deleteKuda }) {
  const { title = "New Detail", countTotal, names = [] } = kuda; // Ensure title and names default values
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
    updateKuda({ ...kuda, names: newNames });
  };

  const deleteSlice = (index) => {
    const newNames = names.filter((_, i) => i !== index);
    updateKuda({ ...kuda, names: newNames });
  };

  const resetNames = () => {
    updateKuda({ ...kuda, names: [] });
  };

  const handleTitleChange = (newTitle) => {
    updateKuda({ ...kuda, title: newTitle });
  };

  return (
    <details style={styles.details}>
      <summary>
        {/* Editable title */}
        <EditableText text={title} onTextChange={handleTitleChange} /> - 
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


// Slice component
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

// EditableText component
const EditableText = ({ text, onTextChange }) => {
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
    onTextChange(value); // Update the text in Firebase after editing
  };

  return (
    <div onDoubleClick={handleDoubleClick}>
      {isEditing ? (
        <input type="text" value={value} onChange={handleChange} onBlur={handleBlur} autoFocus />
      ) : (
        <span>{value}</span>
      )}
    </div>
  );
}

// Inline styling for beautification
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
