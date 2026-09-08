import { useNavigate } from "react-router-dom"

export default function Home() {
  const navigate = useNavigate();

  const on_click = () => {
    navigate('/');
  }

  return (
    <>
      <h1>Tela Inicial</h1>
      <button onClick={on_click}>Sair</button>
    </>
  )
}