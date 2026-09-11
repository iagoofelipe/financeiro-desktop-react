import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"
import type { ConnectionRestoredData } from "../types/pywebview";

export default function Error() {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const handleConnectionRestored = (event: Event) => {
      const customEvent = event as CustomEvent<ConnectionRestoredData>;
      const data = customEvent.detail;
      console.log('connection-restored', data);
      navigate(data.authenticationRequired? '/login' : '/home');
    };

    window.addEventListener('connection-restored', handleConnectionRestored);

    return () => {
      window.removeEventListener('connection-restored', handleConnectionRestored);
    };
  }, [navigate]);

  return (
    <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div>
        <p className="title">Financeiro</p>
        <p>{location.state?.message ?? 'Não foi possível estabelecer uma conexão com o servidor'}</p>
      </div>
      <img style={{maxHeight: "900px", width: '50%'}} src="/imgs/astronaut.svg"></img>
    </div>
  )
}