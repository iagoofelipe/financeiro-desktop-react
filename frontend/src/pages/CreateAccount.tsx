import '/src/styles/pages/Login.css'

import { useState } from 'react'
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
    const response = await window.pywebview.api.createAccount({
      username: username,
      password: password,
      email: email,
      firstName: firstName,
      lastName: lastName,
    });

    if (response.success) {
      navigate("/login");
      return;
    }

    setBlockInputs(false);
    addToast({
      title: 'Criação de conta',
      message: response.error,
      type: 'warning',
    });
  }

  return (
    <div className='login'>
      <div className='card form'>
        <p className='title' style={{ textAlign: 'center' }}>Financeiro</p>
        <p className='subtitle' style={{ textAlign: 'center' }}>Seu controle financeiro em um só lugar</p>
        <div>
          <p className='form-control-label'>Usuário</p>
          <input className='form-control' disabled={blockInputs} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div style={{display: 'flex', columnGap: '1rem'}}>
          <div>
          <p className='form-control-label'>Senha</p>
            <input className='form-control' disabled={blockInputs} type="password" onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div>
          <p className='form-control-label'>Confirmar Senha</p>
            <input className='form-control' disabled={blockInputs} type="password" onChange={(e) => setPasswordConfirm(e.target.value)} />
          </div>
        </div>
        <div>
          <p className='form-control-label'>E-mail</p>
          <input className='form-control' disabled={blockInputs} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div style={{display: 'flex', columnGap: '1rem'}}>
          <div>
          <p className='form-control-label'>Primeiro Nome</p>
            <input className='form-control' disabled={blockInputs} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div>
          <p className='form-control-label'>Último Nome</p>
            <input className='form-control' disabled={blockInputs} onChange={(e) => setLastName(e.target.value)} />
          </div>
        </div>
        <p style={{ color: 'var(--text-secondary)' }}>Já possui uma conta? <a onClick={() => navigate('/login')} style={{ color: 'var(--text-secondary)' }}>acesse aqui</a></p>
        <button className='btn btn-focus' disabled={blockInputs} onClick={on_click}>criar</button>
      </div>
      <img src="/imgs/data-extraction.svg" />
    </div>
  )
}