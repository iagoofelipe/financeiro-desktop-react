import PanelLeftSVG from '../assets/panel-left-filled.svg?react'
import DashboardSVG from '../assets/dashboard.svg?react'
import CardSVG from '../assets/credit-card.svg?react'
import SettingsSVG from '../assets/gear-fill.svg?react'
import UserSVG from '../assets/person-fill.svg?react'
import TableSVG from '../assets/table.svg?react'
import LogoutSVG from '../assets/logout.svg?react'
import ReloadSVG from '../assets/arrow-repeat.svg?react'

import '../styles/pages/Home.css'
import { useEffect, useState, type ChangeEvent } from 'react'

export default function Home() {
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [nav, setNav] = useState('dash');
  const [user, setUser] = useState('Usuário');
  const [yearMonth, setYearMonth] = useState('');
  const [offlineMode, setOfflineMode] = useState(false);

  // TODO: verificar por que a API é invocada 3 vezes ao carregar o componente
  
  const handleSyncClicked = async () => {
    setOfflineMode(true);

    if (!window.pywebview?.api)
      return;

    const user = await window.pywebview.api.getUser();
    
    setUser(user? user.fullName : '');
    // // setYearMonth(await window.pywebview.api.getDefaultYearMonth());
    setOfflineMode(false);
  };

  useEffect(() => {
    let isMounted = true;

    // dados iniciais
    const syncData = () => {
      setOfflineMode(true);

      window.pywebview?.api.getUser().then((result) => {
        if (!isMounted || !result)
          return;

        setUser(result.fullName);
      });

      window.pywebview?.api.getDefaultYearMonth().then((result) => {
        if (!isMounted || yearMonth)
          return;

        setYearMonth(result);
      });

      setOfflineMode(false);
    };

    if (window.pywebview?.api.getUser) {
      syncData();
    } else {
      window.addEventListener('pywebviewready', syncData);
    }

    // vinculando eventos connection-*
    const onConnectionBroken = () => setOfflineMode(true);
    const onConnectionRestored = () => setOfflineMode(false);

    window.addEventListener('connection-broken', onConnectionBroken);
    window.addEventListener('connection-restored', onConnectionRestored);

    // cleanup
    return () => {
      isMounted = false;
      window.removeEventListener('pywebviewready', syncData);
      window.removeEventListener('connection-broken', onConnectionBroken);
      window.removeEventListener('connection-restored', onConnectionRestored);
    };
  });


  const handleNavClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setNav(e.currentTarget.name);
  };

  return (
    <div className='home-container'>
      
      <nav className={`card ${navCollapsed && 'nav-collapsed'}`}>
        <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
          <img src='/imgs/logo.svg' height='40' style={{marginRight: '5px'}} hidden={navCollapsed}></img>
          <p className='title-2' style={{marginRight: 'auto'}} hidden={navCollapsed}>Financeiro</p>
          <PanelLeftSVG height='25' width='25' onClick={() => {setNavCollapsed(!navCollapsed)}}/>
        </div>
        <div className='h-line h-line-overflow-parent' />
        <button onClick={handleNavClick} name='dash' className={`btn nav-btn ${nav == 'dash' && 'btn-focus'}`}><DashboardSVG /><p hidden={navCollapsed}>Dashboards</p></button>
        <button onClick={handleNavClick} name='regs' className={`btn nav-btn ${nav == 'regs' && 'btn-focus'}`}><TableSVG /><p hidden={navCollapsed}>Registros</p></button>
        <button onClick={handleNavClick} name='cards' className={`btn nav-btn ${nav == 'cards' && 'btn-focus'}`}><CardSVG /><p hidden={navCollapsed}>Cartões e Faturas</p></button>
        <button onClick={handleNavClick} name='settings' className={`btn nav-btn ${nav == 'settings' && 'btn-focus'}`}><SettingsSVG /><p hidden={navCollapsed}>Configurações</p></button>
        <div style={{height: 'stretch'}}></div>
        <div className='h-line h-line-overflow-parent' />
        <button onClick={handleNavClick} name='user' className={`btn nav-btn ${nav == 'user' && 'btn-focus'}`}><UserSVG /><p hidden={navCollapsed}>{user}</p></button>
        <button onClick={handleNavClick} name='logout' className='btn nav-btn' disabled={offlineMode}><LogoutSVG /><p hidden={navCollapsed}>Sair</p></button>
      </nav>
      
      <div style={{display: 'flex', flexDirection: 'column', rowGap: 'var(--gap)', width: '100%'}}>
        <div className='card' style={{display:'flex', flexDirection: 'row', columnGap: 'var(--gap)', alignItems: 'center'}}>
          <p className='title' style={{marginRight: 'auto'}}>NAV TITLE</p>
          <ReloadSVG disabled={offlineMode} className='btn btn-outline' height='19' width='19' onClick={handleSyncClicked}/>
          <input disabled={offlineMode} type='month' className='form-control' value={yearMonth} onChange={(e:ChangeEvent<HTMLInputElement>) => { setYearMonth(e.target.value) }} />
        </div>
        <div className='card' style={{height: '100%'}}>CONTENT</div>
      </div>

    </div>
  )
}