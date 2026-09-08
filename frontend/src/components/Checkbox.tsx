import { useId, type ChangeEvent } from 'react';

interface CheckboxProps {
  id?: string;
  label?: string;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
}

export default function Checkbox({id, label, checked, disabled, onChange}:CheckboxProps) {
  const inpId = id ?? useId();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.checked);
    }
  }

  return (
    <div>
      <input type='checkbox' id={inpId} checked={checked} disabled={disabled} onChange={handleChange} style={{marginRight: '10px', cursor: 'pointer'}}/>
      { label && <label htmlFor={inpId} style={{cursor: 'pointer'}}>{label}</label>}
    </div>
  )
}