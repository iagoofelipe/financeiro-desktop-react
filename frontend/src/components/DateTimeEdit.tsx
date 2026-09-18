import type { ChangeEvent, KeyboardEvent } from 'react';
import { useState } from "react";

interface DateTimeEditProps {
  label?: string;
  value?: string;
  disabled?: boolean;
  typeMonth?: boolean;
  notStretch?:boolean;
  onChange?: (value:string) => void;
  onReturnPressed?: () => void;
}

export function getNow(typeMonth?:boolean) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  if (typeMonth)
    return `${year}-${month}`;

  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hour}:${min}`;
};

export default function DateTimeEdit({label, value, disabled, typeMonth, notStretch, onChange, onReturnPressed}:DateTimeEditProps) {
  const [datetime, setDatetime] = useState(value ?? getNow(typeMonth));

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDatetime(e.target.value);
    if (onChange)
      onChange(e.target.value);
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onReturnPressed) {
      e.preventDefault();
      onReturnPressed();
    }
  };
  
  return (
    <div style={{width: '100%'}}>
      {label && <p className='form-control-label'>{label}</p>}
      <input type={typeMonth ? "month" : "datetime-local"} onKeyDown={handleKeyDown} onChange={handleChange} value={datetime} className={`form-control ${notStretch && 'not-stretch'}`} disabled={disabled} />
    </div>
  )
}