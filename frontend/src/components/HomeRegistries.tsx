import { useEffect, useRef, useState, type ReactNode } from 'react'
import MoneyAlertSVG from '../assets/money-bag-alert.svg?react'
import MoneySuccessSVG from '../assets/money-bag-success.svg?react'
import MoneyReciveSVG from '../assets/money-recive.svg?react'
import MoneySendSVG from '../assets/money-send.svg?react'

import '../styles/components/HomeRegistries.css'
import { useToast } from '../context/ToastContext';
import SelectCancelable from './SelectCancelable'
import Table from './Table'
import NewRegistryForm, { type NewRegistryFormData } from './NewRegistryForm'
import type { RegistryData } from '../types/pywebview'
import DialogConfirm from './DialogConfirm'

interface HomeRegistriesProps {
  yearMonth: string;
  syncTriggerCount?: number;
  onNext: (element:ReactNode) => void;
  onReturn: () => void;
}

const STATUS_BY_NAME = {
  PENDING: 'Pendente',
  LATE: 'Atrasado',
  ACCOUNTED: 'Contabilizado',
  OK: 'Pago',
}

const ICON_TRANSACTION_IN = <MoneyReciveSVG title='Entrada' height='25' width='25' style={{color: 'var(--success-color)'}}/>;
const ICON_TRANSACTION_OUT = <MoneySendSVG title='Saída' height='25' width='25' style={{color: 'var(--fail-color)'}}/>;

export default function HomeRegistries({ yearMonth, syncTriggerCount, onNext, onReturn }:HomeRegistriesProps) {
  const [transactionsViewMode, setTransactionsViewMode] = useState('table');
  const [sumIn, setSumIn] = useState('R$ 0,00');
  const [sumOut, setSumOut] = useState('R$ 0,00');
  const [amount, setAmount] = useState('R$ 0,00');
  const [positiveAmount, setPositiveAmount] = useState(true);
  const [cards, setCards] = useState<{value:string, text:string}[]>([]);
  const [transactionsNode, setTransactionsNode] = useState<ReactNode[][]>([[]]);
  const [transactionsData, setTransactionsData] = useState<RegistryData[]>();
  const [transactionDetail, setTransactionDetail] = useState<RegistryData>();
  const [numTransactions, setNumTransactions] = useState(0);
  const [offlineMode, setOfflineMode] = useState(false);
  const [indexRowSelected, setIndexRowSelected] = useState<number>();
  const hasSyncedInitialData = useRef(false);
  const cardId = useRef('');
  const refYearMonth = useRef(yearMonth);
  const { addToast } = useToast();

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [messageModal, setMessageModal] = useState<string>();
  const [titleModal, setTitleModal] = useState<string>();

  // Eventos
  const handleSaveNewReg = async (data:NewRegistryFormData) => {
    const response = await window.pywebview?.api.addRegistry(data);
    if (response) {
      if (response.success) {
        addToast({title: 'Novo Registro', message: 'Dados armazenados com sucesso!', type: 'success'});
        onReturn();
      } else
        addToast({title: 'Novo Registro', message: response.error, type: 'danger'});
    } else
      addToast({title: 'Novo Registro', message: 'Não foi possível processar a solicitação (InternalError)', type: 'danger'});
  };

  const handleNewReg = () => {
    onNext(<NewRegistryForm yearMonth={yearMonth} onReturn={onReturn} onSave={handleSaveNewReg} />);
  };

  const handleDeleteReg = () => {
    setTitleModal('Confirmar Exclusão');
    setMessageModal(`Deseja confirmar a exclusão da transação "${transactionDetail?.title}"?`);
    setShowModal(true);
  };

  const handleDeleteRegConfirmed = async () => {
    if (!transactionDetail)
      return;

    const response = await window.pywebview?.api.deleteRegistryById(transactionDetail.id);
    if (!response?.success) {
      addToast({title: 'Exclusão de Dados', message: 'Não foi possível processar a solicitação!', type: 'warning'});
      return;
    }

    addToast({title: 'Exclusão de Dados', message: 'Dados excluídos com êxito!', type: 'success'});
    loadTransactions();
  };

  const handleTableTransactionsRowSelected = (index?:number) => {
    const transactionData = transactionsData && index != undefined? transactionsData[index] : undefined;
    setTransactionDetail(transactionData);
    setIndexRowSelected(index);

    console.log(transactionData);
    if (transactionData) {
    }
  };

  // Funções
  const clearTransactionSelection = () => {
    setTransactionDetail(undefined);
    setIndexRowSelected(undefined);
  };

  const loadTransactions = async () => {
    if (!window.pywebview?.api.getRegistries || !yearMonth)
      return;

    console.log('loading transactions');
    
    const response = await window.pywebview.api.getRegistries({yearMonth, cardId: cardId.current? parseInt(cardId.current) : undefined});
    if (!response.success || !response.data)
      return;

    let _sumIn = 0, _sumOut = 0, _amount = 0;
    response.data.forEach(reg => {
      if (reg.type_in)
        _sumIn += reg.value;
      else
        _sumOut += reg.value;
    });

    setSumIn('R$ ' + _sumIn.toLocaleString('BRL'));
    setSumOut('R$ ' + _sumOut.toLocaleString('BRL'));
    setAmount('R$ ' + (_amount = _sumIn - _sumOut).toLocaleString('BRL'));
    setPositiveAmount(_amount >= 0);
    setNumTransactions(response.data.length);
    setTransactionsData(response.data);

    // limpando cache
    clearTransactionSelection();

    setTransactionsNode(response.data.map(reg => {
      return [
        reg.type_in? ICON_TRANSACTION_IN : ICON_TRANSACTION_OUT,
        reg.title + (reg.installment_formatted? ` (${reg.installment_formatted})` : ''),
        'R$ ' + reg.value.toLocaleString('BRL'),
        <span className={'transaction-status transaction-status-'+reg.status.toLowerCase()}>{STATUS_BY_NAME[reg.status]}</span>,
        reg.occurrence_formatted,
        reg.responsable_name,
        reg.card_name,
      ]
    }));
  };
  
  if (yearMonth != refYearMonth.current) {
    console.log(`change refYear from "${refYearMonth.current}" to "${yearMonth}"`);
    refYearMonth.current = yearMonth;
    loadTransactions();
  }
  
  useEffect(() => {
    // dados iniciais
    const syncData = async () => {
      if (!window.pywebview || (hasSyncedInitialData.current && syncTriggerCount == 0))
        return;
      
      console.log('HomeRegistries useEffect sync');
      hasSyncedInitialData.current = true;
      setOfflineMode(true);

      const response = await window.pywebview.api.getCards();
      if (!response.success || !response.data)
        return;
      
      console.log('HomeRegistries setCards');
      setCards(
        response.data.map(v => { return {value: v.id.toString(), text: v.name} })
      );

      await loadTransactions();
      setOfflineMode(false);
    };

    if (window.pywebview?.api.getCards)
      syncData();
    else
      window.addEventListener('pywebviewready', syncData);

    // vinculando eventos connection-*
    const onConnectionBroken = () => setOfflineMode(true);
    const onConnectionRestored = () => setOfflineMode(false);

    window.addEventListener('connection-broken', onConnectionBroken);
    window.addEventListener('connection-restored', onConnectionRestored);

    // cleanup
    return () => {
      window.removeEventListener('pywebviewready', syncData);
      window.removeEventListener('connection-broken', onConnectionBroken);
      window.removeEventListener('connection-restored', onConnectionRestored);
    };
  }, [syncTriggerCount]);

  const transactionsContent = transactionsViewMode == 'table'?
    <Table columns={['Tipo', 'Título', 'Valor', 'Status', 'Ocorrência', 'Responsável', 'Cartão']} indexRowSelected={indexRowSelected} selectable hiddenIndexColumns={cardId.current? [6] : undefined} onRowSelected={handleTableTransactionsRowSelected} values={transactionsNode}/> :
    '';

  return (
    <div className='home-regs-container'>
      <div className='card transactions'>

        <div className='transactions-header' style={{position: 'sticky', top: '0', zIndex: '10', background: 'inherit', padding: '1rem 0'}}>
          <p className='title'>Transações</p>
          <p className='counter' style={{marginRight: 'auto'}}>{numTransactions}</p>
          <div className='transactions-header-details'>
            <MoneyReciveSVG height='25' width='25' style={{color: 'var(--success-color)'}}/>
            <p title='total de entradas'>{sumIn}</p>
            <MoneySendSVG height='25' width='25' style={{color: 'var(--fail-color)'}}/>
            <p title='total de saídas'>{sumOut}</p>
            {
              positiveAmount?
              <MoneySuccessSVG height='25' width='25' style={{color: 'var(--success-color)'}}/> :
              <MoneyAlertSVG height='25' width='25' style={{color: 'var(--fail-color)'}}/>
            }
            <p title='saldo final'>{amount}</p>
          </div>
          <div className='v-line'/>
          <SelectCancelable title='Cartão' notStretch values={cards} disabled={offlineMode} onChanged={async c => {cardId.current = c; await loadTransactions()}} />
          <button className='btn btn-outline win-icon' onClick={handleNewReg}>&#xF8AA;</button>
          <div className='select-btn-group'>
            <button className={`btn win-icon ${transactionsViewMode == 'table' && 'btn-focus'}`} onClick={() => setTransactionsViewMode('table')}>&#xF2C7;</button>
            <button className={`btn win-icon ${transactionsViewMode == 'grid' && 'btn-focus'}`} onClick={() => setTransactionsViewMode('grid')}>&#xE8A9;</button>
          </div>
        </div>

        <div className='transactions-content'>
          {transactionsContent}
        </div>
        
      </div>

      <div className='card transaction-details' hidden={transactionDetail === undefined}>
        <div style={{display: 'flex', alignItems: 'center', columnGap: 'var(--gap)'}}>
          <p className='title' style={{marginRight: 'auto'}}>Detalhes</p>
          <button className='btn btn-outline win-icon' onClick={handleDeleteReg}>&#xe74d;</button>
          <button className='btn btn-outline win-icon' onClick={clearTransactionSelection}>&#xEA4C;</button>
        </div>
        <div>
          <p>Título</p>
          <p className='form-control-label'>{transactionDetail?.title ?? '-'}</p>
        </div>
        <div>
          <p>Tipo</p>
          <p className='form-control-label'>{transactionDetail? (transactionDetail.type_in? 'Entrada' : 'Saída') : '-'}</p>
        </div>
        <div>
          <p>Valor</p>
          <p className='form-control-label'>{'R$ ' + (transactionDetail?.value ?? 0).toLocaleString('BRL')}</p>
        </div>
        <div hidden={!transactionDetail?.occurrence_formatted}>
          <p>Ocorrência</p>
          <p className='form-control-label'>{transactionDetail?.occurrence_formatted ?? '-'}</p>
        </div>
        <div hidden={!transactionDetail?.category}>
          <p>Categoria</p>
          <p className='form-control-label'>{transactionDetail?.category ?? '-'}</p>
        </div>
        <div hidden={!transactionDetail?.card_name}>
          <p>Cartão</p>
          <p className='form-control-label'>{transactionDetail?.card_name? transactionDetail?.card_name: '-'}</p>
        </div>
        <div hidden={!transactionDetail?.description}>
          <p>Descrição</p>
          <p className='form-control-label'>{transactionDetail?.description ?? '-'}</p>
        </div>
        <div hidden={!transactionDetail?.responsable_name}>
          <p>Responsável</p>
          <p className='form-control-label'>{transactionDetail?.responsable_name? transactionDetail?.responsable_name : '-'}</p>
        </div>
        <div>
          <p>Status</p>
          <div style={{display: 'flex'}}>
            {
              transactionDetail?.status?
              <span style={{marginTop: '5px'}} className={'transaction-status transaction-status-'+transactionDetail.status.toLowerCase()}>{STATUS_BY_NAME[transactionDetail.status]}</span>
              :
              <p className='form-control-label'>-</p>
            }
          </div>
        </div>
      </div>
  

      {/* <button onClick={() => setShowModal(true)}>Abrir Modal Nativo</button> */}
      <DialogConfirm onClose={() => setShowModal(false)} show={showModal} message={messageModal} title={titleModal} onConfirm={handleDeleteRegConfirmed} />


      {/* <dialog ref={dialogRef} style={{ borderRadius: 'var(--border-radius)', padding: 'var(--padding)', minWidth: '400px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', rowGap: 'var(--gap)' }}>
        <p className='title'>Confirmar Exclusão</p>
        <p>Você confirma a exclusão de ""?</p>
        <div style={{display: 'flex'}}>
          <button className='btn btn-outline' style={{width: '100%', marginRight: 'var(--gap)'}} onClick={fecharDialog}>Cancelar</button>
          <button className='btn btn-focus' style={{width: '100%'}} onClick={() => { console.log('Confirmado!'); fecharDialog(); }}>OK</button>
        </div>
      </dialog> */}
    </div>
  );
}