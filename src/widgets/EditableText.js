import React, { useState } from 'react';
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
        {(isEditing==true||value==="")? (
          <input type="text" value={value} onChange={handleChange} onBlur={handleBlur} autoFocus />
        
        ) : (
          <span>{value}</span>
        )}
      </div>
    );
  }

  export default EditableText;