import '/src/styles/pages/Login.css'

import { useEffect, useState } from 'react'
import Checkbox from '../components/Checkbox'
import LineEdit from '../components/LineEdit'
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [blockInputs, setBlockInputs] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleConnectionBroken = () => {
      setBlockInputs(true);
    };

    const handleConnectionRestored = () => {
      setBlockInputs(false);
    };
    
    window.addEventListener('connection-broken', handleConnectionBroken);
    window.addEventListener('connection-restored', handleConnectionRestored);

    return () => {
    window.removeEventListener('connection-broken', handleConnectionBroken);
      window.removeEventListener('connection-restored', handleConnectionRestored);
    };
  }, [setBlockInputs]);

  const onAuth = async () => {
    // verificando campos digitados
    if (!username || !password) {
      addToast({
        title: 'Validação de Parâmetros',
        message: 'preencha todos os campos para prosseguir!',
        type: 'warning',
      });
      return;
    }

    setBlockInputs(true);
    const response = await window.pywebview?.api.authenticate(username, password, remember);

    if (response?.success) {
      navigate("/home");
      return;
    }

    setBlockInputs(false);
    addToast({
      title: 'Autenticação',
      message: response?.error ?? '',
      type: 'warning',
    });
  }

  return (
    <div className='login'>
      <div className='card form'>
        <p className='title-1' style={{ textAlign: 'center' }}>Financeiro</p>
        <p className='title-2' style={{ textAlign: 'center' }}>Seu controle financeiro em um só lugar</p>
        <LineEdit label='Usuário' disabled={blockInputs} onChange={(v) => setUsername(v)} />
        <LineEdit label='Senha' disabled={blockInputs} mask onReturnPressed={onAuth} onChange={(v) => setPassword(v)} />
        <p style={{ color: 'var(--text-secondary)' }}>Não possui uma conta? <a onClick={() => navigate('/createAccount')} style={{ color: 'var(--text-secondary)' }}>crie agora</a></p>
        <Checkbox label='Lembrar de mim' disabled={blockInputs} onChange={(v) => setRemember(v)} />
        <button className='btn btn-focus' disabled={blockInputs} onClick={onAuth}>acessar</button>
      </div>
      <img src="/imgs/data-extraction.svg" />
    </div>
  )
}