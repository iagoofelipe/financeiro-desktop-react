import { useState } from "react";

import '../styles/components/NewRegistryForm.css'
import LineEdit from "./LineEdit";
import LineDateTimeEdit from "./LineDateTimeEdit";

interface NewRegistryFormProps {
  onReturn?: () => void;
  onCancel?: () => void;
}

export default function NewRegistryForm() {
  const [typeIn, setTypeIn] = useState(false);

  return (
    <div className="card new-reg-form">
      <div>
        <label><input type="radio" name="type_in" checked={typeIn} onChange={(e) => setTypeIn(e.target.checked)} />Entrada</label>
        <label style={{marginLeft: 'var(--gap)'}}><input type="radio" name="type_in" checked={!typeIn} onChange={(e) => setTypeIn(!e.target.checked)} />Saída</label>
      </div>
      <LineEdit label="Título"/>
      <LineEdit label="Valor"/>
      <LineDateTimeEdit label="Ocorrência"/>
      <LineDateTimeEdit label="Referência" typeMonth/>
    </div>
  );
}