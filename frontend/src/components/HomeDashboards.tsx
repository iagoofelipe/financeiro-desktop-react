import ProgressDownSVG from '../assets/progress-down.svg?react'
import ProgressUpSVG from '../assets/progress-up.svg?react'
import '../styles/components/HomeDashboards.css'

import { useEffect, useRef, useState } from "react";
import type { BalanceData } from '../types/pywebview';

interface HomeDashboardsProps {
  yearMonth: string;
}

export default function HomeDashboards({ yearMonth }:HomeDashboardsProps) {
  const hasSyncedInitialData = useRef(false);
  const [balance, setBalance] = useState<BalanceData>();
  const refYearMonth = useRef(yearMonth);

  const loadBalance = () => {
    window.pywebview?.api.getBalance({yearMonth}).then((response) => {
      if (!response.success || !response.data)
        return;

      setBalance(response.data);
    });
  };

  if (yearMonth != refYearMonth.current) {
    console.log(`change refYear NAV-DASH from "${refYearMonth.current}" to "${yearMonth}"`);
    refYearMonth.current = yearMonth;
    loadBalance();
  }

  useEffect(() => {
    // dados iniciais
    const syncData = () => {
      if (hasSyncedInitialData.current)
        return;

      hasSyncedInitialData.current = true;
      loadBalance();
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

  return (
    <>
    <div className='card dash-first-card'>
      <div style={{display: "flex", columnGap: "var(--gap)"}}>
        <img src='/imgs/money-in.svg' height='60px'/>
        <div>
          <p className='subtitle'>Entradas</p>
          <p>R$ <span>{balance?.total_in.toLocaleString("BRL")}</span></p>
          <div style={{display: "flex"}}>
            {balance?.total_in_progress?
              <ProgressUpSVG color="green" height="25" width="25"/> :
              <ProgressDownSVG color="red" height="25" width="25"/>
            }
            <p style={{marginLeft: "5px"}}>{balance?.total_in_progress_description}</p>
          </div>
        </div>
      </div>
      <img src='/imgs/money-out.svg' height='60px'/>
      <img src='/imgs/balance.svg' height='60px'/>
      {balance?.total_out_progress?
        <ProgressDownSVG color="green" height="25" width="25"/> :
        <ProgressUpSVG color="red" height="25" width="25"/>
      }
    </div>
    </>
  );
}