import { Routes, Route } from "react-router-dom";

import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Farejar from "./pages/Farejar";
import MeuPet from "./pages/MeuPet";
import CadastroPet from "./pages/CadastroPet";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
           <Route element={<ProtectedRoute />}>
        <Route path="/farejar" element={<Farejar />} />
        <Route path="/meu-pet" element={<MeuPet />} />
        <Route path="/cadastro-pet" element={<CadastroPet />} />
      </Route>
    </Routes>
  );
}

export default App;
