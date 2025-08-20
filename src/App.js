import { BrowserRouter as Router, Routes, Route, useParams } from "react-router-dom";
import Login from "./components/Login";
import NuevaMinuta from "./pages/NuevaMinuta";
import Signup from "./components/Signup";
import Dashboard from "./pages/Dashboard";
import Dashboard2 from "./pages/Dashboard2";
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
      <Router>
        <Routes>
          <Route path="/" element={<NuevaMinuta />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Signup />} />
          <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
          <Route path="/dashboard2" element={<ProtectedLayout><Dashboard2 /></ProtectedLayout>} />
          <Route path="/alertas" element={<ProtectedLayout><Alertas /></ProtectedLayout>} />
          <Route path="*" element={<ProtectedLayout><h1>Page not found</h1></ProtectedLayout>} />
          <Route path="/sesion/:id" element={<ProtectedLayout><Maquina /></ProtectedLayout>} />
          <Route path="/sesiones" element={<ProtectedLayout><Sesiones/></ProtectedLayout>} />
          <Route path="/ordenes" element={<ProtectedLayout><OrdenesProduccion/></ProtectedLayout>} />
          <Route path="/ordenes/:id" element={<ProtectedLayout><DetalleOrden /></ProtectedLayout>} />
          <Route path="/sesiones/personas" element={<ProtectedLayout><Personas/></ProtectedLayout>} />
          <Route path="/sesiones/equipos" element={<ProtectedLayout><Equipos/></ProtectedLayout>} />
        </Routes>
      </Router>
    </AspectRatioProvider>
  );
}

export default App;
