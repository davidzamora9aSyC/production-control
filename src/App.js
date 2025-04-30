import { BrowserRouter as Router, Routes, Route, useParams } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./pages/Dashboard";
import { AspectRatioProvider } from "./context/AspectRatioContext";
import Alertas from "./pages/Alertas";
import Navbar from "./components/Navbar";
import Recursos from "./pages/Recursos";
import Maquina from "./pages/Maquina";
import ScrollToTop from "./components/ScrollToTop";
import OrdenesProduccion from "./pages/OrdenesProduccion";
import DetalleOrden from "./pages/DetalleOrden";

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
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Signup />} />
          <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
          <Route path="/alertas" element={<ProtectedLayout><Alertas /></ProtectedLayout>} />
          <Route path="*" element={<ProtectedLayout><h1>Page not found</h1></ProtectedLayout>} />
          <Route path="/maquina/:id" element={<ProtectedLayout><Maquina /></ProtectedLayout>} />
          <Route path="/recursos" element={<ProtectedLayout><Recursos/></ProtectedLayout>} />
          <Route path="/ordenes" element={<ProtectedLayout><OrdenesProduccion/></ProtectedLayout>} />
          <Route path="/ordenes/:id" element={<ProtectedLayout><DetalleOrden /></ProtectedLayout>} />
        </Routes>
      </Router>
    </AspectRatioProvider>
  );
}

export default App;
