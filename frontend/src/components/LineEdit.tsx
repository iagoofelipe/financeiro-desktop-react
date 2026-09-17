import type { ChangeEvent, KeyboardEvent } from 'react';
import '/src/styles/components/LineEdit.css'

interface LineEditProps {
  label?: string;
  type?: string;
  value?: string;
  disabled?: boolean;
  onChange?: (value:string) => void;
  onReturnPressed?: () => void;
}

export default function LineEdit({label, value, type, disabled, onChange, onReturnPressed}:LineEditProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
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
      {label && <p className='line-edit-label'>{label}</p>}
      <input type={type ?? 'text'}  onKeyDown={handleKeyDown} onChange={handleChange} value={value} className="form-control" disabled={disabled} />
    </div>
  )
}