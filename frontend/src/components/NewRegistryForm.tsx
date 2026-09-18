import { useEffect, useId, useRef, useState } from "react"

import '../styles/components/NewRegistryForm.css'
import DateTimeEdit, { getNow } from "./DateTimeEdit"

export interface NewRegistryFormData {
  title: string;
  value: number;
  occurrence: string;
  yearMonth: string;
  typeIn: boolean;
  status: 'PENDING' | 'ACCOUNTED' | 'OK';
  description: string;
  category: string;
}

interface NewRegistryFormProps {
  data?:NewRegistryFormData;
  yearMonth?: string;
  onReturn?: () => void;
  onSave?: (data:NewRegistryFormData) => void;
}

export default function NewRegistryForm({ data, yearMonth, onReturn, onSave }:NewRegistryFormProps) {
  const [typeIn, setTypeIn] = useState(false);
  const [title, setTitle] = useState(data?.title ?? '');
  const [desc, setDesc] = useState(data?.description ?? '');
  const [value, setValue] = useState(data?.value ?? 0);
  const [status, setStatus] = useState(data?.status ?? 'PENDING');
  const [occurrence, setOcurrence] = useState(data?.occurrence? data?.occurrence : getNow());
  const [_yearMonth, setYearMonth] = useState(data?.yearMonth ?? yearMonth ?? getNow(true));
  const [category, setCategory] = useState(data?.category ?? '');
  const [suggestionCats, setSuggestionCats] = useState<string[]>([]);
  const categoryDatalistId = useId();
  const hasSyncedInitialData = useRef(false);

  useEffect(() => {
    if (hasSyncedInitialData.current)
        return;

    hasSyncedInitialData.current = true;

    const updateSuggestions = () => {
      window.pywebview?.api.getSuggestionCategories().then((result) => {
        if (!result.success || !result.data)
          return;
        
        console.log('suggestionCategories invoked');
        setSuggestionCats(result.data);
      })
    }
    
    if (window.pywebview?.api.getSuggestionCategories)
      updateSuggestions();
    else
      window.addEventListener('pywebviewready', updateSuggestions);
    
    return () => {
      window.removeEventListener('pywebviewready', updateSuggestions);
    }
  }, []);

  const handleSave = () => {
    onSave && onSave({
      title: title,
      value: isNaN(value)? 0 : value,
      occurrence: occurrence,
      yearMonth: _yearMonth,
      typeIn: typeIn,
      status: status,
      description: desc,
      category: category,
    });
  };

  return (
    <div className="card new-reg-form">
      <div>
        <label><input style={{marginRight: '5px'}} type="radio" name="type_in" checked={typeIn} onChange={(e) => setTypeIn(e.target.checked)} />Entrada</label>
        <label style={{marginLeft: 'var(--gap)'}}><input style={{marginRight: '5px'}} type="radio" name="type_in" checked={!typeIn} onChange={(e) => setTypeIn(!e.target.checked)} />Saída</label>
      </div>
      <div>
        <p className="form-control-label">Título*</p>
        <input className="form-control" value={title} onChange={(e) => {setTitle(e.target.value)}} />
      </div>
      <div>
        <p className="form-control-label">Descrição</p>
        <input className="form-control" value={desc} onChange={(e) => {setDesc(e.target.value)}} />
      </div>
      <div>
        <p className="form-control-label">Valor</p>
        <input type="number" className="form-control" value={value} onChange={(e) => {setValue(e.target.valueAsNumber)}} step="0.01" min="0" />
      </div>
      <DateTimeEdit label="Ocorrência*" value={occurrence} onChange={setOcurrence}/>
      <DateTimeEdit label="Referência*" typeMonth value={_yearMonth} onChange={setYearMonth}/>
      <div>
        <p className="form-control-label">Status</p>
        <select className="form-control" value={status} onChange={(e) => setStatus(e.target.value as 'PENDING'|'OK'|'ACCOUNTED')}>
          <option value="PENDING">Pendente</option>
          <option value="OK">Pago</option>
          <option value="ACCOUNTED">Contabilizado</option>
        </select>
      </div>
      <div>
        <p className="form-control-label">Categoria</p>
        <input className="form-control" list={categoryDatalistId} value={category} placeholder="Outros" onChange={(e) => {setCategory(e.target.value)}} step="0.01" min="0" />
        <datalist id={categoryDatalistId}>
          { suggestionCats.map((v) => { return <option key={v} value={v}/> }) }
        </datalist>
      </div>

      <div className="foot">
        <button className="btn btn-outline btn-focus" onClick={onReturn}>Voltar</button>
        <button className="btn btn-outline btn-focus" onClick={handleSave}>Salvar</button>
      </div>
    </div>
  );
}