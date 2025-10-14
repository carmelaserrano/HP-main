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
import PageTransition from '../cliente/COMPONENTES/PageTransition'

// Importar dashboards
import HuespedDashboard from '../cliente/COMPONENTES/huesped/HuespedDashboard'
import OperadorDashboard from '../cliente/COMPONENTES/operador/OperadorDashboard'
import AdminDashboard from '../cliente/COMPONENTES/admin/AdminDashboard'

// Importar ProtectedRoute
import ProtectedRoute from '../cliente/COMPONENTES/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
    <ScrollToTop />
      <div>
        <Navbar />

        <PageTransition>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/habitaciones" element={<Habitaciones />} />
            <Route path="/restaurantes" element={<Restaurantes />} />
            <Route path="/sobre-nosotros" element={<SobreNosotros />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/actividades" element={<Actividades />} />
            <Route path="/servicios" element={<Servicios />} />
            <Route path="/login" element={<Login />} />

            {/* Rutas protegidas por rol */}
            <Route 
              path="/huesped" 
              element={
                <ProtectedRoute allowedRoles={['huesped']}>
                  <HuespedDashboard />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/operador" 
              element={
                <ProtectedRoute allowedRoles={['operador', 'admin']}>
                  <OperadorDashboard />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </PageTransition>

        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App