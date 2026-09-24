import { useEffect, useRef } from "react";

interface DialogConfirmProps {
  title?:string;
  message?:string;
  show?:boolean;
  onConfirm?: () => void;
  onClose?: () => void;
}

export default function DialogConfirm({title, message, show, onConfirm, onClose}:DialogConfirmProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const close = () => dialogRef.current?.close();

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog)
      return;

    if (show && !dialog.open)
      dialog.showModal();
    else if (!show && dialog.open)
      dialog.close();
  }, [show]);
  
  return (
    <dialog ref={dialogRef} onClose={onClose} style={{ borderRadius: 'var(--border-radius)', padding: 'var(--padding)', minWidth: '400px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', rowGap: 'var(--gap)' }}>
      <p className='title' hidden={!title}>{title}</p>
      <p>{message ?? 'Deseja confirmar esta ação?'}</p>
      <div style={{display: 'flex'}}>
        <button className='btn btn-outline' style={{width: '100%', marginRight: 'var(--gap)'}} onClick={close}>Cancelar</button>
        <button className='btn btn-focus' style={{width: '100%'}} onClick={() => {close(); onConfirm && onConfirm()}}>OK</button>
      </div>
    </dialog>
  );
}