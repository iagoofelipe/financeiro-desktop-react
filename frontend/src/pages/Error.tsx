import { useLocation } from "react-router-dom"

export default function Error() {
  const location = useLocation();

  return (
    <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div>
        <p className="title">Financeiro</p>
        <p>{location.state?.message ?? 'Não foi possível estabelecer uma conexão com o servidor'}</p>
      </div>
      <img style={{maxHeight: "900px", width: '50%'}} src="/imgs/astronaut.svg"></img>
    </div>
  )
}