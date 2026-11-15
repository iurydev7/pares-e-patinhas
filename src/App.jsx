import { Routes, Route } from "react-router-dom";

import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Farejar from "./pages/Farejar";
import MeuPet from "./pages/MeuPet";
import PerfilPet from "./pages/PerfilPet";
import CadastroPet from "./pages/CadastroPet";
import MinhaConta from "./pages/MinhaConta";
import ProtectedRoute from "./components/ProtectedRoute";
import FarejarGuard from "./components/FarejarGuard";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/minha-conta" element={<MinhaConta />} />
          <Route path="/cadastro-pet" element={<CadastroPet />} />
          <Route path="/editar-pet/:petId" element={<CadastroPet />} />
          <Route path="/meu-pet" element={<MeuPet />} />
          <Route path="/meu-pet/:petId" element={<MeuPet />} />

          <Route element={<FarejarGuard />}>
            <Route path="/farejar" element={<Farejar />} />
            <Route path="/perfil-pet/:petId" element={<PerfilPet />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
