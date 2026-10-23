import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Anunciante from './pages/Anunciante'
import Admin from './pages/Admin'
import Institucional from './pages/Institucional'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/anunciante" element={<Anunciante />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/institucional" element={<Institucional />} />
      </Route>
    </Routes>
  )
}

export default App