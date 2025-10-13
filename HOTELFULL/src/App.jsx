import './App.css'
import '../cliente/ESTILOS/transicion.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from '../cliente/COMPONENTES/Navbar'
import Footer from '../cliente/COMPONENTES/Footer'
import Home from '../cliente/PAGINAS/Home'
import Habitaciones from '../cliente/PAGINAS/Habitaciones'
import Restaurantes from '../cliente/PAGINAS/Restaurantes'
import SobreNosotros from '../cliente/PAGINAS/SobreNosotros'
import Contacto from '../cliente/PAGINAS/Contacto'
import Actividades from '../cliente/PAGINAS/Actividades'
import Servicios from '../cliente/PAGINAS/Servicios'
import ScrollToTop from '../cliente/COMPONENTES/ScrollToTop'
import Login from '../cliente/PAGINAS/Login' 

function App() {
  return (
    <BrowserRouter>
    <ScrollToTop />
      <div>
        <Navbar />

        <div className="page-container fade-in">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/habitaciones" element={<Habitaciones />} />
            <Route path="/restaurantes" element={<Restaurantes />} />
            <Route path="/sobre-nosotros" element={<SobreNosotros />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/actividades" element={<Actividades />} />
            <Route path="/servicios" element={<Servicios />} />

            {/* 🔹 Nueva ruta de login */}
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>

        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
