import { useEffect, useId, useRef, useState } from "react"

import '../styles/components/NewRegistryForm.css'
import DateTimeEdit, { getNow } from "./DateTimeEdit"
import type { CardData, ResponsableData } from "../types/pywebview";
import { useToast } from "../context/ToastContext";

export interface NewRegistryFormData {
  title: string;
  value: number;
  occurrence: string;
  yearMonth: string;
  typeIn: boolean;
  status: 'PENDING' | 'ACCOUNTED' | 'OK';
  description: string;
  category: string;
  responsableId?: number;
  cardId?: number;
  currentInstallment: number;
  totalInstallments: number;
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
  const [currentInstallment, setCurrentInstallment] = useState(data?.currentInstallment ?? 1);
  const [totalInstallments, setTotalInstallments] = useState(data?.totalInstallments ?? 1);
  const [status, setStatus] = useState(data?.status ?? 'PENDING');
  const [occurrence, setOcurrence] = useState(data?.occurrence? data?.occurrence : getNow());
  const [_yearMonth, setYearMonth] = useState(data?.yearMonth ?? yearMonth ?? getNow(true));
  const [suggestionCats, setSuggestionCats] = useState<string[]>([]);
  const hasSyncedInitialData = useRef(false);
  const { addToast } = useToast();
  
  // categories
  const categoryDatalistId = useId();
  const [category, setCategory] = useState(data?.category ?? '');
  
  // responsables
  const [responsable, setResponsable] = useState(data?.responsableId ?? '');
  const [responsables, setResponsables] = useState<ResponsableData[]>([]);
  const [responsableHidden, setResponsableHidden] = useState(data?.responsableId == undefined);
  
  // cards
  const [card, setCard] = useState(data?.cardId?.toString() ?? '');
  const [cards, setCards] = useState<CardData[]>([]);

  useEffect(() => {
    if (hasSyncedInitialData.current)
        return;

    hasSyncedInitialData.current = true;

    const loadData = async () => {
      const response_cats = await window.pywebview?.api.getSuggestionCategories();
      if (response_cats?.data)
        setSuggestionCats(response_cats.data);

      const response_responsables = await window.pywebview?.api.getResponsables();
      if (response_responsables?.data)
        setResponsables(response_responsables.data);

      const response_cards = await window.pywebview?.api.getCards();
      if (response_cards?.data)
        setCards(response_cards.data);
    }
    
    if (window.pywebview?.api.getSuggestionCategories)
      loadData();
    else
      window.addEventListener('pywebviewready', loadData);
    
    return () => {
      window.removeEventListener('pywebviewready', loadData);
    }
  }, []);

  const handleSave = () => {
    // verificando campos em branco
    if (!title || !occurrence || !_yearMonth) {
      addToast({
        title: 'Validação de Entradas',
        message: 'Preencha todos os campos obrigatórios para prosseguir!',
        type: 'danger',
      });

      return;
    }

    onSave && onSave({
      title: title,
      value: isNaN(value)? 0 : value,
      occurrence: occurrence,
      yearMonth: _yearMonth,
      typeIn: typeIn,
      status: status,
      description: desc,
      category: category,
      cardId: card == ''? undefined : Number(card),
      totalInstallments: totalInstallments,
      currentInstallment: currentInstallment,
    });
  };

  return (
    <div className="card new-reg-form">
      <p className="title">{data? 'Atualizar Registro' : 'Novo Registro'}</p>
      <div className="h-line h-line-overflow-parent"/>
      <div className="content">
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
          <input type="number" placeholder="0" className="form-control" value={value} onChange={(e) => {setValue(e.target.valueAsNumber)}} step="0.01" min="0" />
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
          <input className="form-control" list={categoryDatalistId} value={category} placeholder="Outros" onChange={(e) => {setCategory(e.target.value)}} />
          <datalist id={categoryDatalistId}>
            { suggestionCats.map((v) => { return <option key={v} value={v}/> }) }
          </datalist>
        </div>
        <label><input style={{marginRight: '5px'}} type="checkbox" checked={responsableHidden} onChange={(e) => {setResponsableHidden(e.target.checked)}}/>Pessoal</label>
        <div hidden={responsableHidden}>
          <p className="form-control-label">Responsável</p>
          <select className="form-control"  value={responsable} onChange={(e) => setResponsable(e.target.value)}>
            { responsables.map((v) => { return <option key={v.id} value={v.id}>{v.name}</option> }) }
          </select>
        </div>
        <div>
          <p className="form-control-label">Cartão</p>
          <div style={{display: 'flex'}}>
            <select className="form-control" value={card} onChange={(e) => setCard(e.target.value)}>
              <option hidden value=''></option>
              { cards.map((v) => { return <option key={v.id} value={v.id}>{v.name}</option> }) }
            </select>
            <button style={{marginLeft: '10px'}} hidden={card == ''} onClick={() => setCard('')} className="btn btn-outline win-icon">&#xe711;</button>
          </div>
        </div>
        <div style={{display: "flex"}}>
          <div style={{width: '100%', marginRight: 'var(--gap)'}}>
            <p className="form-control-label">Parcela Atual</p>
            <input type="number" placeholder="1" className="form-control" value={currentInstallment} onChange={(e) => {setCurrentInstallment(e.target.valueAsNumber)}} min="1" />
          </div>
          <div style={{width: '100%'}}>
            <p className="form-control-label">Total de Parcelas</p>
            <input type="number" placeholder="1" className="form-control" value={totalInstallments} onChange={(e) => {setTotalInstallments(e.target.valueAsNumber)}} min="1" />
          </div>
        </div>
      </div>

      <div className="h-line h-line-overflow-parent"/>
      <div className="foot">
        <button className="btn btn-outline" onClick={onReturn}>Voltar</button>
        <button className="btn btn-outline btn-focus" onClick={handleSave}>Salvar</button>
      </div>
    </div>
  );
}