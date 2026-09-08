import '/src/styles/pages/Login.css'

import { useState } from 'react'
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

  const on_click = async () => {
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
    const success = await window.pywebview?.api.authenticate({ username: username, password: password, remember: remember });


    if (success) {
      navigate("/home");
      return;
    }

    setBlockInputs(false);
    addToast({
      title: 'Autenticação',
      message: 'Usuário ou senha incorretos!',
      type: 'warning',
    });
  }

  return (
    <div className='login'>
      <div className='card form'>
        <p className='title' style={{ textAlign: 'center' }}>Financeiro</p>
        <p className='subtitle' style={{ textAlign: 'center' }}>Seu controle financeiro em um só lugar</p>
        <LineEdit label='Usuário' disabled={blockInputs} onChange={(v) => setUsername(v)} />
        <LineEdit label='Senha' disabled={blockInputs} mask onChange={(v) => setPassword(v)} />
        <p style={{ color: 'var(--text-secondary)' }}>Não possui uma conta? <a href='#' style={{ color: 'var(--text-secondary)' }}>crie agora</a></p>
        <Checkbox label='Lembrar de mim' disabled={blockInputs} onChange={(v) => setRemember(v)} />
        <button className='btn btn-focus' disabled={blockInputs} onClick={on_click}>acessar</button>
      </div>
      <img src="/data-extraction.svg" />
    </div>
  )
}