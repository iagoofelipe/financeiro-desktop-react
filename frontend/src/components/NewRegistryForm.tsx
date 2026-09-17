import { useState } from "react"

import '../styles/components/NewRegistryForm.css'
import LineEdit from "./LineEdit"
import LineDateTimeEdit, { getNow } from "./LineDateTimeEdit"

export interface NewRegistryFormData {
  title: string;
  value: number;
  occurrence: string;
  date_ref: string;
}

interface NewRegistryFormProps {
  onReturn?: () => void;
  onSave?: (data:NewRegistryFormData) => void;
}

export default function NewRegistryForm({ onReturn, onSave }:NewRegistryFormProps) {
  const [typeIn, setTypeIn] = useState(false);
  const [title, setTitle] = useState('');
  const [value, setValue] = useState('');
  const [occurrence, setOcurrence] = useState(getNow);
  const [yearMonth, setYearMonth] = useState(getNow(true));

  const handleSave = () => {
    onSave && onSave({
      title: title,
      value: value === '' ? 0 : Number(value),
      occurrence: occurrence,
      date_ref:yearMonth+'-01',
    });
  };

  return (
    <div className="card new-reg-form">
      <div>
        <label><input type="radio" name="type_in" checked={typeIn} onChange={(e) => setTypeIn(e.target.checked)} />Entrada</label>
        <label style={{marginLeft: 'var(--gap)'}}><input type="radio" name="type_in" checked={!typeIn} onChange={(e) => setTypeIn(!e.target.checked)} />Saída</label>
      </div>
      <LineEdit label="Título" value={title} onChange={setTitle}/>
      <LineEdit label="Valor" type="number" value={value} onChange={setValue}/>
      <LineDateTimeEdit label="Ocorrência" value={occurrence} onChange={setOcurrence}/>
      <LineDateTimeEdit label="Referência" typeMonth value={yearMonth} onChange={setYearMonth}/>
      <div className="foot">
        <button className="btn btn-outline btn-focus" onClick={onReturn}>Voltar</button>
        <button className="btn btn-outline btn-focus" onClick={handleSave}>Salvar</button>
      </div>
    </div>
  );
}