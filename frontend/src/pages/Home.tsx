import '../styles/pages/Home.css'
import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import HomeDashboards from '../components/HomeDashboards'
import HomeRegistries from '../components/HomeRegistries'

export default function Home() {
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [nav, setNav] = useState('Registros');
  const [user, setUser] = useState('Usuário');
  const [yearMonth, setYearMonth] = useState('');
  const [offlineMode, setOfflineMode] = useState(false);
  const hasSyncedInitialData = useRef(false);
  const isMounted = useRef(false);

  const handleSyncClicked = async () => {
    setOfflineMode(true);

    if (!window.pywebview?.api)
      return;

    const user = await window.pywebview.api.getUser();
    
    setUser(user? user.fullName : '');
    setOfflineMode(false);
  };

  useEffect(() => {
    isMounted.current = true;

    // dados iniciais
    const syncData = () => {
      if (hasSyncedInitialData.current)
        return;

      hasSyncedInitialData.current = true;
      setOfflineMode(true);

      window.pywebview?.api.getUser().then((result) => {
        if (!isMounted.current || !result)
          return;

        setUser(result.fullName);
      });

      window.pywebview?.api.getDefaultYearMonth().then((result) => {
        if (!isMounted.current || yearMonth)
          return;

        setYearMonth(result);
      });

      setOfflineMode(false);
    };

    if (window.pywebview?.api.getDefaultYearMonth)
      syncData();
    else
      window.addEventListener('pywebviewready', syncData);

    // vinculando eventos connection-*
    const onConnectionBroken = () => setOfflineMode(true);
    const onConnectionRestored = () => setOfflineMode(false);

    window.addEventListener('connection-broken', onConnectionBroken);
    window.addEventListener('connection-restored', onConnectionRestored);

    // cleanup
    return () => {
      isMounted.current = false;
      window.removeEventListener('pywebviewready', syncData);
      window.removeEventListener('connection-broken', onConnectionBroken);
      window.removeEventListener('connection-restored', onConnectionRestored);
    };
  }, []);


  const handleNavClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setNav(e.currentTarget.name);
  };

  // definindo conteúdo principal
  let content;

  switch (nav) {
    case 'Dashboards':
      content = <HomeDashboards  />;
      break;

    case 'Registros':
      content = <HomeRegistries yearMonth={yearMonth}/>;
      break;

    default:
      content = <div className='card' style={{height: '100%'}}></div>;
      break;
  }

  return (
    <div className='home-container'>
      <nav className={`card ${navCollapsed && 'nav-collapsed'}`}>
        <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
          <img src='/imgs/logo.svg' height='40' style={{marginRight: '5px'}} hidden={navCollapsed}></img>
          <p className='title-2' style={{marginRight: 'auto'}} hidden={navCollapsed}>Financeiro</p>
          <span onClick={() => {setNavCollapsed(!navCollapsed)}} className='win-icon' style={{cursor: 'pointer'}}>&#xE746;</span>
        </div>
        <div className='h-line h-line-overflow-parent' />
        <button onClick={handleNavClick} name='Dashboards' className={`btn nav-btn ${nav == 'Dashboards' && 'btn-focus'}`}><span className='win-icon'>&#xECA5;</span><p hidden={navCollapsed}>Dashboards</p></button>
        <button onClick={handleNavClick} name='Registros' className={`btn nav-btn ${nav == 'Registros' && 'btn-focus'}`}><span className='win-icon'>&#xE8A5;</span><p hidden={navCollapsed}>Registros</p></button>
        <button onClick={handleNavClick} name='Cartões e Faturas' className={`btn nav-btn ${nav == 'Cartões e Faturas' && 'btn-focus'}`}><span className='win-icon'>&#xE8C7;</span><p hidden={navCollapsed}>Cartões e Faturas</p></button>
        <button onClick={handleNavClick} name='Configurações' className={`btn nav-btn ${nav == 'Configurações' && 'btn-focus'}`}><span className='win-icon'>&#xE713;</span><p hidden={navCollapsed}>Configurações</p></button>
        <div style={{height: 'stretch'}}></div>
        <div className='h-line h-line-overflow-parent' />
        <button onClick={handleNavClick} name='user' className='btn nav-btn'><span className='win-icon'>&#xE77B;</span><p hidden={navCollapsed}>{user}</p></button>
        <button onClick={handleNavClick} name='logout' className='btn nav-btn' disabled={offlineMode}><span className='win-icon'>&#xF3B1;</span><p hidden={navCollapsed}>Sair</p></button>
      </nav>
      
      <div style={{display: 'flex', flexDirection: 'column', rowGap: 'var(--gap)', width: '100%'}}>
        <div className='card' style={{display:'flex', flexDirection: 'row', columnGap: 'var(--gap)', alignItems: 'center'}}>
          <p className='title' style={{marginRight: 'auto'}}>{nav}</p>
          <button disabled={offlineMode || true} className='btn btn-outline win-icon' onClick={handleSyncClicked}>&#xEDAB;</button>
          <button disabled={offlineMode} className='btn btn-outline win-icon'>&#xEDAC;</button>
          <input disabled={offlineMode} type='month' className='form-control' value={yearMonth} onChange={(e:ChangeEvent<HTMLInputElement>) => { setYearMonth(e.target.value) }} />
        </div>
        {content}
      </div>
    </div>
  )
}