// Kuda.js
import React from "react";

const Kuda = ({ kuda, index, updateKuda, deleteKuda }) => {
  return (
    <div>
      <h3>{kuda.title}</h3>
      <button onClick={() => updateKuda({ ...kuda, countTotal: kuda.countTotal + 1 })}>Increase</button>
      <button onClick={deleteKuda}>Delete</button>
    </div>
  );
};

export default Kuda;
