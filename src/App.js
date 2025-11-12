import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import NuevaMinuta from "./pages/NuevaMinuta";
import DashboardLegacy from "./pages/Dashboard";
import Dashboard from "./pages/Dashboard2";
import { AspectRatioProvider } from "./context/AspectRatioContext";
import Alertas from "./pages/Alertas";
import Navbar from "./components/Navbar";
import Sesiones from "./pages/Sesiones";
import Maquina from "./pages/Maquina";
import ScrollToTop from "./components/ScrollToTop";
import OrdenesProduccion from "./pages/OrdenesProduccion";
import DetalleOrden from "./pages/DetalleOrden";
import Personas from "./pages/Personas";
import Equipos from "./pages/Equipos";
import { AuthProvider } from "./context/AuthContext";
import { AreasProvider } from "./context/AreasContext";
import RequireAuth from "./components/RequireAuth";

const ProtectedLayout = ({ children }) => (
  <>
    <ScrollToTop />
    <Navbar />
    <div className="mt-20">
      {children}
    </div>
  </>
);

function App() {
  return (
    <AspectRatioProvider>
      <AuthProvider>
        <AreasProvider>
        <Router>
          <Routes>
            <Route path="/" element={<NuevaMinuta />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard2"
              element={
                <RequireAuth>
                  <ProtectedLayout><DashboardLegacy /></ProtectedLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/dashboard/*"
              element={
                <RequireAuth>
                  <ProtectedLayout><Dashboard /></ProtectedLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/alertas"
              element={
                <RequireAuth>
                  <ProtectedLayout><Alertas /></ProtectedLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/sesion/:id"
              element={
                <RequireAuth>
                  <ProtectedLayout><Maquina /></ProtectedLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/sesiones"
              element={
                <RequireAuth>
                  <ProtectedLayout><Sesiones/></ProtectedLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/ordenes"
              element={
                <RequireAuth>
                  <ProtectedLayout><OrdenesProduccion/></ProtectedLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/ordenes/:id"
              element={
                <RequireAuth>
                  <ProtectedLayout><DetalleOrden /></ProtectedLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/sesiones/personas"
              element={
                <RequireAuth>
                  <ProtectedLayout><Personas/></ProtectedLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/sesiones/equipos"
              element={
                <RequireAuth>
                  <ProtectedLayout><Equipos/></ProtectedLayout>
                </RequireAuth>
              }
            />
            <Route path="*" element={<ProtectedLayout><h1>Page not found</h1></ProtectedLayout>} />
          </Routes>
        </Router>
        </AreasProvider>
      </AuthProvider>
    </AspectRatioProvider>
  );
}

export default App;
