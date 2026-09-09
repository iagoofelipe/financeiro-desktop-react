import LoadingSVG from '../assets/loading.svg?react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Loading() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndNavigate = async () => {
      if (!await window.pywebview?.api.isServerAvailable()) {
        navigate('/error', {state: {message: 'Não foi possível estabelecer uma conexão com o servidor'}});
        return;
      }
      
      const isAuth = await window.pywebview?.api.isAuthenticated();
      navigate(isAuth ? '/home' : '/login');
    };

    if (window.pywebview?.api) {
      checkAuthAndNavigate();
    } else {
      window.addEventListener('pywebviewready', checkAuthAndNavigate);
    }

    return () => {
      window.removeEventListener('pywebviewready', checkAuthAndNavigate);
    };
  }, [navigate]);

  return (
    <div style={{ margin: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <p className="title">Financeiro</p>
      <LoadingSVG height="100" color="var(--bg-highlight-primary)" />
    </div>
  );
}