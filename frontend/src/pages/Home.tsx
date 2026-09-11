import PanelLeftSVG from '../assets/panel-left-filled.svg?react'
import DashboardSVG from '../assets/dashboard.svg?react'
import CardSVG from '../assets/credit-card.svg?react'
import SettingsSVG from '../assets/gear-fill.svg?react'
import UserSVG from '../assets/person-fill.svg?react'
import TableSVG from '../assets/table.svg?react'
import LogoutSVG from '../assets/logout.svg?react'
import '../styles/pages/Home.css'
import { useEffect, useState, type ChangeEvent } from 'react'

export default function Home() {
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [nav, setNav] = useState('dash');
  const [user, setUser] = useState('Usuário');
  const [yearMonth, setYearMonth] = useState('');

  useEffect(() => {
    let isMounted = true;

    const syncData = () => {
      // atualizando usuário
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
    };

    if (window.pywebview?.api.getUser) {
      syncData();
    } else {
      window.addEventListener('pywebviewready', syncData);
    }

    return () => {
      isMounted = false;
      window.removeEventListener('pywebviewready', syncData);
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
        <button onClick={handleNavClick} name='logout' className='btn nav-btn'><LogoutSVG /><p hidden={navCollapsed}>Sair</p></button>
      </nav>
      <div style={{display: 'flex', flexDirection: 'column', rowGap: 'var(--gap)', width: '100%'}}>
        <div className='card' style={{display:'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <p className='title'>NAV TITLE</p>
          <input type='month' className='form-control' value={yearMonth} onChange={(e:ChangeEvent<HTMLInputElement>) => { setYearMonth(e.target.value) }} />
        </div>
        <div className='card' style={{height: '100%'}}>CONTENT</div>
      </div>
    </div>
  )
}