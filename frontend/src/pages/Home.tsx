import '../styles/pages/Home.css'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import HomeDashboards from '../components/HomeDashboards'
import HomeRegistries from '../components/HomeRegistries'
import { useNavigate } from 'react-router-dom';

// interface NavElement {
//   title:string;
//   component:React.JSX.Element;
// }

export default function Home() {
  const navigate = useNavigate();
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [navTitle, setNavTitle] = useState('Registros');
  // const [navElements, setNavElements] = useState<NavElement[]>([]);
  // const [content, setContent] = useState<React.JSX.Element>(<div/>);
  const [user, setUser] = useState('Usuário');
  const [yearMonth, setYearMonth] = useState('');
  const [offlineMode, setOfflineMode] = useState(false);
  const [contentOverride, setContentOverride] = useState<ReactNode>(null);
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
        console.log(`sync data yearMonth=${result}`)
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

  const handleLogout = async () => {
    await window.pywebview?.api.logout();
    navigate('/login');
  };

  const handleOnNext = (element: React.JSX.Element) => {
    setContentOverride(element);
  };

  const handleNavClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setNavTitle(e.currentTarget.name);
    setContentOverride(null);
  };

  // atualizando conteúdo principal
  let navContent: React.JSX.Element;

  switch (navTitle) {
    case 'Dashboards':
      navContent = <HomeDashboards yearMonth={yearMonth}/>;
      break;

    case 'Registros':
      navContent = <HomeRegistries yearMonth={yearMonth} onNext={handleOnNext} onReturn={() => setContentOverride(null)}/>;
      break;

    default:
      navContent = <div className='card' style={{height: '100%'}} />;
      break;
  }

  const content = contentOverride ?? navContent;

  return (
    <div className='home-container'>
      <nav className={`card ${navCollapsed && 'nav-collapsed'}`}>
        <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
          <img src='/imgs/logo.svg' height='40' style={{marginRight: '5px'}} hidden={navCollapsed}></img>
          <p className='title-2' style={{marginRight: 'auto'}} hidden={navCollapsed}>Financeiro</p>
          <span onClick={() => {setNavCollapsed(!navCollapsed)}} className='win-icon' style={{cursor: 'pointer'}}>&#xE746;</span>
        </div>
        <div className='h-line h-line-overflow-parent' />
        <button onClick={handleNavClick} name='Dashboards' className={`btn nav-btn ${navTitle == 'Dashboards' && 'btn-focus'}`}><span className='win-icon'>&#xECA5;</span><p hidden={navCollapsed}>Dashboards</p></button>
        <button onClick={handleNavClick} name='Registros' className={`btn nav-btn ${navTitle == 'Registros' && 'btn-focus'}`}><span className='win-icon'>&#xE8A5;</span><p hidden={navCollapsed}>Registros</p></button>
        <button onClick={handleNavClick} name='Cartões e Faturas' className={`btn nav-btn ${navTitle == 'Cartões e Faturas' && 'btn-focus'}`}><span className='win-icon'>&#xE8C7;</span><p hidden={navCollapsed}>Cartões e Faturas</p></button>
        <button onClick={handleNavClick} name='Configurações' className={`btn nav-btn ${navTitle == 'Configurações' && 'btn-focus'}`}><span className='win-icon'>&#xE713;</span><p hidden={navCollapsed}>Configurações</p></button>
        <div style={{height: 'stretch'}}></div>
        <div className='h-line h-line-overflow-parent' />
        <button onClick={handleNavClick} name='user' className='btn nav-btn'><span className='win-icon'>&#xE77B;</span><p hidden={navCollapsed}>{user}</p></button>
        <button onClick={handleLogout} name='logout' className='btn nav-btn' disabled={offlineMode}><span className='win-icon'>&#xF3B1;</span><p hidden={navCollapsed}>Sair</p></button>
      </nav>
      
      <div style={{display: 'flex', flexDirection: 'column', rowGap: 'var(--gap)', width: '100%'}}>
        <div className='card' style={{display:'flex', flexDirection: 'row', columnGap: 'var(--gap)', alignItems: 'center'}}>
          <a className='title' style={{marginRight: 'auto', cursor: 'pointer'}}>{navTitle}</a>
          <button disabled={offlineMode || true} className='btn btn-outline win-icon' onClick={handleSyncClicked}>&#xEDAB;</button>
          <button disabled={offlineMode} className='btn btn-outline win-icon'>&#xEDAC;</button>
          <input disabled={offlineMode} className='form-control not-stretch' type='month' value={yearMonth} onChange={(e) => setYearMonth(e.target.value)} />
        </div>
        {content}
      </div>
    </div>
  )
}