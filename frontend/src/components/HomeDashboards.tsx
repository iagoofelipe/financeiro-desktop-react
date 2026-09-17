import { useEffect, useRef, useState } from "react";

interface HomeDashboardsProps {
  yearMonth: string;
}

export default function HomeDashboards({ yearMonth }:HomeDashboardsProps) {
  const hasSyncedInitialData = useRef(false);
  const [content, setContent] = useState('');
  const refYearMonth = useRef('');

  const loadBalance = () => {
    window.pywebview?.api.getBalance({yearMonth}).then((response) => {
      if (!response.success || !response.data)
        return;

      setContent(`TotalIn: ${response.data.total_in} TotalOut: ${response.data.total_out} PrevTotalIn: ${response.data.total_in} PrevTotalOut: ${response.data.prev_total_out} Amount: ${response.data.total_amount}`);
    });
  };

  if (yearMonth != refYearMonth.current) {
    console.log('change refYear from', refYearMonth.current, 'to', yearMonth);
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

    if (window.pywebview?.api.getCards)
      syncData();
    else
      window.addEventListener('pywebviewready', syncData);

    // cleanup
    return () => {
      window.removeEventListener('pywebviewready', syncData);
    };
  }, []);

  return (
    <div className='card' style={{height: '100%'}}>{content}</div>
  );
}