import '/src/styles/pages/Login.css'

import { useState } from 'react'
import LineEdit from '../components/LineEdit'
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

export default function CreateAccount() {
  

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [blockInputs, setBlockInputs] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const on_click = async () => {
    if (!window.pywebview?.api) {
      console.log('pywebview not loaded');
      return;
    }
    
    // verificando entradas
    if (!username || !password || !email || !firstName || !lastName) {
      addToast({
        title: 'Validação de Parâmetros',
        message: 'preencha todos os campos para prosseguir!',
        type: 'warning',
      });
      return;
    }

    if (password != passwordConfirm) {
      addToast({
        title: 'Validação de Parâmetros',
        message: 'as senhas são diferentes!',
        type: 'warning',
      });
      return;
    }

    setBlockInputs(true);
    const {success, error} = await window.pywebview.api.createAccount({
      username: username,
      password: password,
      email: email,
      firstName: firstName,
      lastName: lastName,
    });

    if (success) {
      navigate("/");
      return;
    }

    setBlockInputs(false);
    addToast({
      title: 'Criação de conta',
      message: error,
      type: 'warning',
    });
  }

  return (
    <div className='login'>
      <div className='card form'>
        <p className='title' style={{ textAlign: 'center' }}>Financeiro</p>
        <p className='subtitle' style={{ textAlign: 'center' }}>Seu controle financeiro em um só lugar</p>
        <LineEdit label='Usuário' disabled={blockInputs} onChange={(v) => setUsername(v)} />
        <div style={{display: 'flex', columnGap: '1rem'}}>
          <LineEdit label='Senha' disabled={blockInputs} mask onChange={(v) => setPassword(v)} />
          <LineEdit label='Confirmar Senha' disabled={blockInputs} mask onChange={(v) => setPasswordConfirm(v)} />
        </div>
        <LineEdit label='E-mail' disabled={blockInputs} onChange={(v) => setEmail(v)} />
        <div style={{display: 'flex', columnGap: '1rem'}}>
          <LineEdit label='Primeiro Nome' disabled={blockInputs} mask onChange={(v) => setFirstName(v)} />
          <LineEdit label='Último Nome' disabled={blockInputs} mask onChange={(v) => setLastName(v)} />
        </div>
        <p style={{ color: 'var(--text-secondary)' }}>Já possui uma conta? <a onClick={() => navigate('/')} style={{ color: 'var(--text-secondary)' }}>acesse aqui</a></p>
        <button className='btn btn-focus' disabled={blockInputs} onClick={on_click}>criar</button>
      </div>
      <img src="/data-extraction.svg" />
    </div>
  )
}