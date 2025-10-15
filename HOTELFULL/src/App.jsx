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
import Registro from '../cliente/PAGINAS/Registro'
import RecuperarPassword from '../cliente/PAGINAS/RecuperarPassword'
import ResetPassword from '../cliente/PAGINAS/ResetPassword'
import PageTransition from '../cliente/COMPONENTES/PageTransition'

// Importar dashboards
import HuespedDashboard from '../backend/COMPONENTES/huesped/HuespedDashboard'
import OperadorDashboard from '../backend/COMPONENTES/operador/OperadorDashboard'
import AdminDashboard from '../backend/COMPONENTES/admin/AdminDashboard'

// Importar ProtectedRoute
import ProtectedRoute from '../cliente/COMPONENTES/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Rutas con Navbar y Footer */}
        <Route path="/" element={<><Navbar /><Home /><Footer /></>} />
        <Route path="/habitaciones" element={<><Navbar /><Habitaciones /><Footer /></>} />
        <Route path="/rooms" element={<><Navbar /><Habitaciones /><Footer /></>} />
        <Route path="/restaurantes" element={<><Navbar /><Restaurantes /><Footer /></>} />
        <Route path="/sobre-nosotros" element={<><Navbar /><SobreNosotros /><Footer /></>} />
        <Route path="/contacto" element={<><Navbar /><Contacto /><Footer /></>} />
        <Route path="/actividades" element={<><Navbar /><Actividades /><Footer /></>} />
        <Route path="/servicios" element={<><Navbar /><Servicios /><Footer /></>} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/recuperar-password" element={<RecuperarPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Rutas protegidas por rol - SIN Navbar y Footer */}
        <Route
          path="/huesped/dashboard"
          element={
            <ProtectedRoute allowedRoles={['huesped']}>
              <HuespedDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/operador/dashboard"
          element={
            <ProtectedRoute allowedRoles={['operador', 'admin']}>
              <OperadorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App