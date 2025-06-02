/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, Suspense, useEffect, FC } from 'react'; 
import { MenuItem } from './entities/entities';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'; 
import './App.css';

import FoodOrder from './components/FoodOrder';
//import { MenuProvider } from './context/MenuContext'; //YA no lo usamos aqui, por el redux
import { AuthProvider, useAuth } from './context/AuthContext';
import logger from './services/logging';
import { authService } from './services/authService';
import { Role } from './services/IAuthService'; 
import ErrorBoundary from './components/ErrorBoundary';


// --- COMPONENTES DE PÁGINA (Lazy Loaded) ---
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));
const AdminStockPage = React.lazy(() => import('./pages/AdminStockPage'));
const LazyFoods = React.lazy(() => import("./components/Foods"));


// // --- DATOS INICIALES --- //LO PASAMOS A menuSlice.ts
// const initialMenuItemsData: MenuItem[] = [
//   { id: 1, name: "Hamburguesa de Pollo", quantity: 40, desc: "Jugosa hamburguesa de pollo, acompañada de frescos vegetales de temporada y tus salsas favoritas.", price: 30, image: "cb.png" },
//   { id: 2, name: "Patatas Fritas", quantity: 40, desc: "Nuestras patatas fritas doradas y perfectamente crujientes, servidas en una generosa porción.", price: 15, image: "chips.png" },
//   { id: 3, name: "Hamburguesas Vegetarianas", quantity: 40, desc: "Deliciosa hamburguesa a base de plantas, repleta de sabor y textura.", price: 20, image: "hv.png" },
//   { id: 4, name: "Helado", quantity: 40, desc: "Refrescante y cremoso helado, disponible en una variedad de sabores clásicos y sorprendentes.", price: 5, image: "ice.png" },
// ];


// --- COMPONENTES AUXILIARES ---

// Navbar
const Navbar: FC = () => {
  const { user, roles } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    logger.info("Navbar: Intentando cerrar sesión.");
    try {
      await authService.signOut();
      logger.info("Navbar: Sesión cerrada exitosamente.");
      navigate('/login');
    } catch (error) {
      logger.error("Navbar: Error al cerrar sesión", error);
    }
  };

  return (
    <nav className="navbar">
      <Link to="/">FoodApp</Link>
      <div>
        {user && roles?.includes(Role.ADMIN) && <Link to="/admin-stock" style={{ marginRight: '10px' }}>Ver Disponibilidad</Link>}
        {user && <Link to="/order" style={{ marginRight: '10px' }}>Pedir Comida</Link>}
        {!user && <Link to="/login" style={{ marginRight: '10px' }}>Login</Link>}
        {!user && <Link to="/register" style={{ marginRight: '10px' }}>Registro</Link>}
        {user && <button onClick={handleLogout}>Logout ({user.email})</button>}
      </div>
    </nav>
  );
};

// ProtectedRoute
interface ProtectedRouteProps { children: JSX.Element; }
const ProtectedRoute: FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="loadingFallback">Autenticando...</div>;
  if (!user) {
    logger.debug("ProtectedRoute: Usuario no autenticado, redirigiendo a /login");
    return <Navigate to="/login" replace />;
  }
  return children;
};

// AdminRoute
interface AdminRouteProps { children: JSX.Element; }
const AdminRoute: FC<AdminRouteProps> = ({ children }) => {
  const { user, roles, isLoading } = useAuth();
  if (isLoading) return <div className="loadingFallback">Autenticando...</div>;
  if (!user) {
    logger.debug("AdminRoute: Usuario no autenticado, redirigiendo a /login");
    return <Navigate to="/login" replace />;
  }
  if (!roles?.includes(Role.ADMIN)) {
    logger.warn("AdminRoute: Acceso denegado. Usuario no es ADMIN.", { userEmail: user.email, roles });
    return <Navigate to="/" replace />; 
  }
  return children;
};

// HomePage
const HomePage: FC = () => {
  const { user } = useAuth();
  useEffect(() => {
    logger.info("HomePage montada");
  }, []);
  return (
    <div>
      <h3 className="title">Comida Rápida Online</h3>
      {user ? <p>Bienvenido, {user.email}</p> : <p>Por favor, inicia sesión o regístrate.</p>}
      <p>Navega usando el menú superior.</p>
    </div>
  );
};



// OrderFlowPage
const OrderFlowPage: FC = () => {
  const [selectedFoodItem, setSelectedFoodItem] = useState<MenuItem | null>(null);

  const handleSelectFood = (food: MenuItem) => {
    setSelectedFoodItem(food);
  };

  const handleReturnToMenu = () => {
    setSelectedFoodItem(null);
  };

  useEffect(() => {
    logger.info("OrderFlowPage montada");
  }, []);

  return (
    <>
      <h3 className="title">Nuestra Carta</h3>
      {!selectedFoodItem && (
        <Suspense fallback={<div className="loadingFallback">Cargando carta...</div>}>
          <LazyFoods onFoodSelected={handleSelectFood} />
        </Suspense>
      )}
      {selectedFoodItem && (
        <FoodOrder
          food={selectedFoodItem}
          onReturnToMenu={handleReturnToMenu}
        />
      )}
    </>
  );
};


// --- COMPONENTE PRINCIPAL DE LA APLICACIÓN  ---
const AppContent: FC = () => {
  useEffect(() => {
    logger.info("AppContent montado");
  }, []);

  return (
    <div className="main-content-area"> 
      <Routes>
        <Route path="/" element={<Suspense fallback="Cargando Inicio..."><HomePage /></Suspense>} />
        <Route path="/login" element={<Suspense fallback="Cargando Login..."><LoginPage /></Suspense>} />
        <Route path="/register" element={<Suspense fallback="Cargando Registro..."><RegisterPage /></Suspense>} />
        <Route
          path="/admin-stock"
          element={
            <AdminRoute>
              <Suspense fallback="Cargando Stock (Admin)...">
                <AdminStockPage />
              </Suspense>
            </AdminRoute>
          }
        />
        <Route
          path="/order"
          element={
            <ProtectedRoute>
              <Suspense fallback="Cargando Pedidos...">
                <OrderFlowPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};


function App() {
  useEffect(() => {
  }, []);

  return (
    <Router>
      <AuthProvider> {/* AuthContext sigue siendo útil para la autenticación */}
        {/* MenuProvider YA NO ES NECESARIO aquí si todo el estado del menú está en Redux */}
        <ErrorBoundary fallback={<div className="errorFallback"><h2>Oops! Algo salió mal en la App.</h2></div>}>
          <Navbar />
          <div className="App"> 
            <Suspense fallback={<div className="loadingFallback">Cargando aplicación...</div>}>
              <AppContent />
            </Suspense>
          </div>
        </ErrorBoundary>
      </AuthProvider>
    </Router>
  );
}
export default App;