import { useNavigate } from "react-router-dom"

export default function Home() {
  const navigate = useNavigate();

  const on_click = () => {
    navigate('/');
  }

  return (
    <div style={{display: "flex", flexDirection: "column", rowGap: "1rem"}}>
      <p>Tela Inicial</p>
      <button onClick={on_click}>Sair</button>
      <button onClick={() => navigate('/error')}>Error Page</button>
    </div>
  )
}