import { useState, type ChangeEvent } from 'react'

interface SelectCancelableProps {
  title:string;
  values: Array<{value:string, text?:string}>;
  disabled?:boolean;
  onChanged?: (val:string) => void;
};

export default function SelectCancelable({ title, values, disabled, onChanged }:SelectCancelableProps) {
  const [selection, setSelection] = useState('');
  const [isSelected, setIsSelected] = useState(false);

  const options = values.map((v) => {
    return <option key={v.value} value={v.value}>{v.text ?? v.value}</option>;
  });

  const handleSelectionChanged = (e:ChangeEvent<HTMLSelectElement>) => {
    setSelection(e.currentTarget.value);
    setIsSelected(e.currentTarget.value != '');

    if (onChanged)
      onChanged(e.currentTarget.value);
  };

  return (
    <>
      <select className='form-control' disabled={disabled} value={selection} hidden={isSelected} onChange={handleSelectionChanged}>
        <option hidden>{title}</option>
        {options}
      </select>
      <div className='form-control-cancelable' style={{ display: isSelected ? 'inherit' : 'none' }}>
        <select className='form-control' disabled={disabled} value={selection} onChange={handleSelectionChanged}>
          {options}
        </select>
        <span className='win-icon' style={{pointerEvents: disabled? 'none' : 'auto'}} onClick={() => { setSelection(''); setIsSelected(false); onChanged && onChanged('') }}>&#xE8BB;</span>
      </div>
    </>
  )
}