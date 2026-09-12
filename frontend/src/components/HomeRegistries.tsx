import { useEffect, useRef, useState, type ReactNode } from 'react'
import MoneyAlertSVG from '../assets/money-bag-alert.svg?react'
import MoneySuccessSVG from '../assets/money-bag-success.svg?react'
import MoneyReciveSVG from '../assets/money-recive.svg?react'
import MoneySendSVG from '../assets/money-send.svg?react'

import '../styles/components/HomeRegistries.css'
import SelectCancelable from './SelectCancelable'
import Table from './Table'

interface HomeRegistriesProps {
  yearMonth: string;
}

export default function HomeRegistries({ yearMonth }:HomeRegistriesProps) {
  const [transactionsViewMode, setTransactionsViewMode] = useState('table');
  const [sumIn, setSumIn] = useState('R$ 0,00');
  const [sumOut, setSumOut] = useState('R$ 0,00');
  const [amount, setAmount] = useState('R$ 0,00');
  const [positiveAmount, setPositiveAmount] = useState(true);
  const [cards, setCards] = useState<{value:string, text:string}[]>([]);
  const [transactions, setTransactions] = useState<ReactNode[][]>([[]]);
  const [offlineMode, setOfflineMode] = useState(false);
  const hasSyncedInitialData = useRef(false);
  const cardId = useRef('');
  const refYearMonth = useRef('');

  const loadTransactions = () => {
    window.pywebview?.api.getRegistries({yearMonth, cardId: cardId.current? parseInt(cardId.current) : undefined}).then((result) => {
      if (!result.success || !result.data)
        return;

      let _sumIn = 0, _sumOut = 0, _amount = 0;

      result.data.forEach(reg => {
        if (reg.type_in)
          _sumIn += reg.value;
        else
          _sumOut += reg.value;
      });

      setSumIn('R$ ' + _sumIn.toLocaleString('BRL'));
      setSumOut('R$ ' + _sumOut.toLocaleString('BRL'));
      setAmount('R$ ' + (_amount = _sumIn - _sumOut).toLocaleString('BRL'));
      setPositiveAmount(_amount >= 0);

      setTransactions(result.data.map(reg => {
        return [
          reg.type_in? <span className='win-icon' title='entrada' style={{color: 'var(--success-color)'}}>&#xF08E;</span> : <span className='win-icon' title='saída' style={{color: 'var(--fail-color)'}}>&#xF090;</span>,
          reg.title + (reg.installment_formatted? ` (${reg.installment_formatted})` : ''),
          reg.value_formatted,
          <span className={'transaction-status transaction-status-'+reg.status.toLowerCase()}>{reg.status}</span>,
          reg.occurrence_formatted,
          reg.responsable_name,
        ]
      }));
    });
  };

  if (yearMonth != refYearMonth.current) {
    console.log('change refYear from', refYearMonth.current, 'to', yearMonth);
    refYearMonth.current = yearMonth;
    loadTransactions();
  }
  
  useEffect(() => {
    // dados iniciais
    const syncData = () => {
      if (hasSyncedInitialData.current)
        return;

      hasSyncedInitialData.current = true;
      setOfflineMode(true);

      window.pywebview?.api.getCards().then((response) => {
        if (!response.success || !response.data)
          return;

        console.log('HomeRegistries setCards');
        setCards(response.data.map(v => {
          return {value: v.id.toString(), text: v.name};
        }));
      });

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
  }, []);

  const transactionsContent = transactionsViewMode == 'table'?
    <Table columns={['Tipo', 'Título', 'Valor', 'Status', 'Ocorrência', 'Responsável']} values={transactions}/> :
    '';

  return (
    <div className='card home-registries' style={{overflow: 'auto', paddingTop: '0'}}>

      <div className='header' style={{position: 'sticky', top: '0', zIndex: '10', background: 'inherit', padding: '1rem 0'}}>
        <p className='title' style={{marginRight: 'auto'}}>Transações</p>
        <div className='details'>
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
        <SelectCancelable title='Cartão' values={cards} disabled={offlineMode} onChanged={c => {cardId.current = c; loadTransactions()}} />
        <button className='btn btn-outline win-icon'>&#xF8AA;</button>
        <div className='select-btn-group'>
          <button className={`btn win-icon ${transactionsViewMode == 'table' && 'btn-focus'}`} onClick={() => setTransactionsViewMode('table')}>&#xF2C7;</button>
          <button className={`btn win-icon ${transactionsViewMode == 'grid' && 'btn-focus'}`} onClick={() => setTransactionsViewMode('grid')}>&#xE8A9;</button>
        </div>
      </div>

      {transactionsContent}

    </div>
  );
}