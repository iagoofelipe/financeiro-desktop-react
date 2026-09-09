import { HashRouter, Routes, Route } from 'react-router-dom'

import { ToastProvider } from './context/ToastContext'
import Login from "./pages/Login"
import Home from "./pages/Home"
import Error from './pages/Error'
import CreateAccount from './pages/CreateAccount'
import Loading from './pages/Loading'

export default function App() {
  return (
    <ToastProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Loading />} />
          <Route path="/loading" element={<Loading />} />
          <Route path="/login" element={<Login />} />
          <Route path="/createAccount" element={<CreateAccount />} />
          <Route path="/home" element={<Home />} />
          <Route path="/error" element={<Error />} />
        </Routes>
      </HashRouter>
    </ToastProvider>
  )
}


// import { useState } from 'react';

// export default function App() {
//   const [resposta, setResposta] = useState<string>('');

//   const chamarPython = async () => {
//     if (window.pywebview?.api) {
//       const res = await window.pywebview.api.saudar('Dev');
//       setResposta(res);
//     } else {
//       setResposta('pywebview API não detectada (rode através do Python).');
//     }
//   };

//   return (
//     <div className='app'>
//       <h1>React + pywebview</h1>
//       <button onClick={chamarPython}>Chamar Método Python</button>
//       {resposta && <p>{resposta}</p>}
//     </div>
//   );
// }