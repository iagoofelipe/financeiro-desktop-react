import ProgressDownSVG from '../assets/progress-down.svg?react'
import ProgressUpSVG from '../assets/progress-up.svg?react'
import '../styles/components/HomeDashboards.css'

import { useEffect, useRef, useState } from "react";
import type { BalanceData, CardData, InvoiceData } from '../types/pywebview';
import { useToast } from '../context/ToastContext';

interface HomeDashboardsProps {
  yearMonth: string;
  syncTriggerCount?: number;
}

export default function HomeDashboards({ yearMonth, syncTriggerCount }:HomeDashboardsProps) {
  const [balance, setBalance] = useState<BalanceData>();
  const [cards, setCards] = useState<CardData[]>();
  const [invoice, setInvoice] = useState<InvoiceData>();
  const [invoiceAccounted, setInvoiceAccounted] = useState('-');
  const [invoicePending, setInvoicePending] = useState('-');
  const { addToast } = useToast();
  const hasSyncedInitialData = useRef(false);
  const refYearMonth = useRef(yearMonth);
  const cardId = useRef('');

  const loadInvoice = async () => {
    if (!window.pywebview)
      return;

    const response = await window.pywebview.api.getInvoiceByCardId(Number(cardId.current), yearMonth);
    setInvoice(response.data);
    setInvoiceAccounted(response.data?.sum_registred? 'R$ '+response.data.sum_registred.toLocaleString('BRL') : '-');
    setInvoicePending(response.data?.sum_pending? 'R$ '+response.data.sum_pending.toLocaleString('BRL') : '-');
  };

  const loadInitialData = async () => {
    if (!window.pywebview?.api)
      return;

    // Balance
    const response_balance = await window.pywebview.api.getBalance({yearMonth});
    setBalance(response_balance.data);

    if (!response_balance.success)
      addToast({title: 'Atualizar Dados', message: response_balance.error, type: 'warning'});
  
    // Cards
    const response_cards = await window.pywebview.api.getCards();
    setCards(response_cards.data);
    if (response_cards.data)
      cardId.current = response_cards.data[0].id.toString();

    // Invoice
    await loadInvoice();
  };


  if (yearMonth != refYearMonth.current) {
    console.log(`change refYear NAV-DASH from "${refYearMonth.current}" to "${yearMonth}"`);
    refYearMonth.current = yearMonth;
    loadInitialData();
  }

  useEffect(() => {
    // dados iniciais
    const syncData = async () => {
      if (!window.pywebview || (hasSyncedInitialData.current && syncTriggerCount == 0))
        return;

      hasSyncedInitialData.current = true;
      await loadInitialData();
    };

    if (window.pywebview?.api.getBalance)
      syncData();
    else
      window.addEventListener('pywebviewready', syncData);

    // cleanup
    return () => {
      window.removeEventListener('pywebviewready', syncData);
    };
  }, []);

  const percentRegistred = invoice && invoice.limit? invoice.sum_registred / invoice.limit * 100 : 0;
  const percentPending = invoice && invoice.limit? invoice.sum_pending / invoice.limit * 100 : 0;
  const percentAvailable = 100 - (percentRegistred + percentPending);
  const available = "R$: " + (invoice? invoice.limit - invoice.sum_registred - invoice.sum_pending : 0).toLocaleString("BRL");

  return (
    <>
    {/* CARD TOP */}
    <div className='card dash-first-card'>
      <div className='item-group'>
        <img src='/imgs/money-in.svg'/>
        <div className='item-group-text-container'>
          <p>Entradas</p>
          <p>R$ <span className='value'>{balance?.total_in.toLocaleString("BRL")}</span></p>
          <div style={{display: balance?.total_in_progress_description? "flex" : "none"}}>
            {balance?.total_in_progress?
              <ProgressUpSVG color="green" height="25" width="25"/> :
              <ProgressDownSVG color="red" height="25" width="25"/>
            }
            <p style={{marginLeft: "5px"}}>{balance?.total_in_progress_description}</p>
          </div>
        </div>
      </div>
      <div className='item-group'>
        <img src='/imgs/money-out.svg'/>
        <div className='item-group-text-container'>
          <p>Saídas</p>
          <p>R$ <span className='value'>{balance?.total_out.toLocaleString("BRL")}</span></p>
          <div style={{display: balance?.total_out_progress_description? "flex" : "none"}}>
            {balance?.total_out_progress?
              <ProgressDownSVG color="green" height="25" width="25"/> :
              <ProgressUpSVG color="red" height="25" width="25"/>
            }
            <p style={{marginLeft: "5px"}}>{balance?.total_out_progress_description}</p>
          </div>
        </div>
      </div>
      <div className='item-group'>
        <img src='/imgs/balance.svg'/>
        <div className='item-group-text-container'>
          <p>Saldo</p>
          <p>R$ <span className='value'>{balance?.current_balance.toLocaleString("BRL")}</span></p>
        </div>
      </div>
    </div>

    {/* CARD CATEGORIES */}
    <div className='card'>
      <div style={{display: "flex", justifyContent: "space-between"}}>
        <p className='title-2'>Categorias</p>
        <select className='form-control not-stretch'>
          <option value="in">Entradas</option>
          <option value="out">Saídas</option>
        </select>
      </div>
    </div>

    {/* CARD INVOICE */}
    <div className='card card-invoice'>
      <div style={{display: "flex", alignItems: "center"}}>
        <p className='title-2' style={{marginRight: "auto"}}>Fatura</p>
        <select className='form-control not-stretch' onChange={async c => {cardId.current = c.target.value; await loadInvoice()}}>
          {cards?.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
      </div>
      <div>
        <p className='title-3'>Valores contabilizados</p>
        <p>{invoiceAccounted}</p>
      </div>
      <div>
        <p className='title-3'>Lançamentos pendentes</p>
        <p>{invoicePending}</p>
      </div>
      <div>
        <p className='title-3'>Fechamento</p>
        <p>{invoice?.closing_date_formatted ?? "-"}</p>
      </div>
      <div>
        <p className='title-3'>Vencimento</p>
        <p>{invoice?.due_date_formatted ?? "-"}</p>
      </div>
      <div style={{width: "stretch", height: "30px", display: "flex"}}>
        <div title={`Contabilizado: ${invoiceAccounted}`} style={{background: "#9AAEC6", height: "100%", width: `${percentRegistred}%`}}></div>
        <div title={`Pendente: ${invoicePending}`} style={{background: "#4D6B93", height: "100%", width: `${percentPending}%`}}></div>
        <div title={`Disponível: ${available}`} style={{background: "#263549", height: "100%", width: `${percentAvailable}%`}}></div>
      </div>
    </div>
    </>
  );
}