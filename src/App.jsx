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
     <Route path="/login" element={<Login />} />

     <Route element={<Layout />}>
       <Route path="/" element={<Home />} />
       <Route element={<ProtectedRoute />}>
        <Route path="/farejar" element={<Farejar />} />   
        <Route path="/meu-pet" element={<MeuPet />} />
       </Route>
       <Route path="/farejar" element={<Farejar />} />
     </Route>
   </Routes>
  );
}

export default App;
