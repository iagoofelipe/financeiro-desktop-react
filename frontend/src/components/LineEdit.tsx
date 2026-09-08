import type { ChangeEvent } from 'react';
import '/src/styles/components/LineEdit.css'

interface LineEditProps {
  label?: string;
  value?: string;
  mask?: boolean;
  disabled?: boolean;
  onChange?: (value:string) => void;
}

export default function LineEdit({label, value, mask, disabled, onChange}:LineEditProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (onChange)
      onChange(e.target.value);
  }
  
  return (
    <div style={{width: '100%'}}>
      {label && <p className='line-edit-label'>{label}</p>}
      <input type={mask? "password" : "text"} onChange={handleChange} value={value} className="line-edit-inp" disabled={disabled} />
    </div>
  )
}