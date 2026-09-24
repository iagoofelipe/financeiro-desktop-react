import { createContext, useContext, useState, type ReactNode, useCallback } from 'react';
import '/src/styles/components/Toast.css';

export interface ToastMessage {
  id: string;
  title?: string;
  message: string;
  type?: 'success' | 'danger' | 'warning' | 'info';
  duration?: number;
}

interface ToastContextType {
  addToast: (options: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ICON_BY_TYPE = {
  'success': <span className='toast-icon win-icon'>&#xe73e;</span>,
  'danger': <span className='toast-icon win-icon'>&#xe894;</span>,
  'warning': <span className='toast-icon win-icon'>&#xe7ba;</span>,
  'info': <span className='toast-icon win-icon'>&#xe946;</span>,
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    ({ title, message, type = 'info', duration = 4000 }: Omit<ToastMessage, 'id'>) => {
      const id = crypto.randomUUID();

      setToasts((prev) => [...prev, { id, title, message, type, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      
      {/* Container fixo para renderizar a pilha de Toasts */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {ICON_BY_TYPE[toast.type ?? 'info']}
            <div className="toast-content">
              {toast.title && <strong>{toast.title}</strong>}
              <p>{toast.message}</p>
            </div>
            <button className="toast-close" onClick={() => removeToast(toast.id)}>
              &times;
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser usado dentro de um ToastProvider');
  }
  return context;
}