import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import logoNavbar from "../assets/logoNavbar.png";
import { useAuth } from "../context/AuthContext";


export default function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const [dropdownAbierto, setDropdownAbierto] = useState(false);
    const [funcionesAbierto, setFuncionesAbierto] = useState(false);
    const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
    const dropdownRef = useRef();
    const funcionesRef = useRef();

    useEffect(() => {
      const handleClickOutside = (e) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
          setDropdownAbierto(false);
        }
        if (funcionesRef.current && !funcionesRef.current.contains(e.target)) {
          setFuncionesAbierto(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
      setMenuMovilAbierto(false);
    }, [location.pathname]);

    const links = [
        { path: "/dashboard", label: "Resumen General" },
        { path: "/ordenes", label: "Órdenes de producción" },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b bg-white">
            <div className="flex items-center gap-4">
              <span onClick={() => navigate("/dashboard")} className="cursor-pointer">
                  <img src={logoNavbar} alt="Logo" className="h-12" />
              </span>
              <button
                className="md:hidden inline-flex flex-col gap-1 focus:outline-none"
                onClick={() => setMenuMovilAbierto((prev) => !prev)}
                aria-label="Abrir menú"
              >
                <span className="w-6 h-0.5 bg-gray-800"></span>
                <span className="w-6 h-0.5 bg-gray-800"></span>
                <span className="w-6 h-0.5 bg-gray-800"></span>
              </button>
            </div>
            <ul className="hidden md:flex gap-16 ml-12 text-lg">
                {links.map(link => (
                  <li key={link.path} className="relative">
                    <span
                      onClick={() => navigate(link.path)}
                      className={`cursor-pointer transition-colors transition-[font-weight] duration-500 ${
                        location.pathname === link.path
                          ? "font-bold text-black text-xl"
                          : "text-gray-600 text-xl font-semibold"
                      }`}
                    >
                      {link.label}
                    </span>
                  </li>
                ))}
                <li key="sesiones" className="relative" ref={dropdownRef}>
                  <span
                    onClick={() => setDropdownAbierto(prev => !prev)}
                    className={`cursor-pointer transition-colors duration-300 text-xl font-semibold text-gray-600 hover:text-black`}
                  >
                    Recursos
                  </span>
                  {dropdownAbierto && (
                    <ul className="absolute bg-white shadow-lg rounded mt-2 w-52 z-50">
                      {[
                        { path: "/sesiones", label: "Sesiones actuales" },
                        { path: "/sesiones/personas", label: "Personas" },
                        { path: "/sesiones/equipos", label: "Equipos" },
                      ].map(sub => (
                        <li key={sub.path} className="border-b last:border-none">
                          <span
                            onClick={() => {
                              navigate(sub.path);
                              setDropdownAbierto(false);
                            }}
                            className={`block px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                              location.pathname === sub.path ? "font-bold text-black" : "text-gray-700"
                            }`}
                          >
                            {sub.label}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
                <li key="funciones" className="relative" ref={funcionesRef}>
                  <span
                    onClick={() => setFuncionesAbierto(prev => !prev)}
                    className="cursor-pointer transition-colors duration-300 text-xl font-semibold text-gray-600 hover:text-black"
                  >
                    Funciones
                  </span>
                  {funcionesAbierto && (
                    <ul className="absolute bg-white shadow-lg rounded mt-2 w-60 z-50">
                      <li className="border-b last:border-none">
                        <span
                          onClick={() => {
                            navigate("/funciones/wifi-qr");
                            setFuncionesAbierto(false);
                          }}
                          className={`block px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                            location.pathname === "/funciones/wifi-qr" ? "font-bold text-black" : "text-gray-700"
                          }`}
                        >
                          WiFi a QR
                        </span>
                      </li>
                    </ul>
                  )}
                </li>
            </ul>
            <button
              onClick={()=>{ logout(); navigate("/login", { replace: true }); }}
              className="hidden md:inline-block text-xl font-bold"
            >
              Cerrar sesión
            </button>
            {menuMovilAbierto && (
              <div className="md:hidden fixed top-20 left-0 right-0 bg-white border-t shadow-lg z-40">
                <div className="px-6 py-4 space-y-4">
                  <div className="flex flex-col gap-3">
                    {links.map(link => (
                      <button
                        key={link.path}
                        onClick={() => navigate(link.path)}
                        className={`text-left text-lg ${location.pathname === link.path ? "font-bold text-black" : "text-gray-700"}`}
                      >
                        {link.label}
                      </button>
                    ))}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Recursos</p>
                    <div className="mt-2 flex flex-col gap-2">
                      {[
                        { path: "/sesiones", label: "Sesiones actuales" },
                        { path: "/sesiones/personas", label: "Personas" },
                        { path: "/sesiones/equipos", label: "Equipos" },
                      ].map(sub => (
                        <button
                          key={sub.path}
                          onClick={() => navigate(sub.path)}
                          className={`text-left ${location.pathname === sub.path ? "font-bold text-black" : "text-gray-700"}`}
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Funciones</p>
                    <button
                      onClick={() => navigate("/funciones/wifi-qr")}
                      className={`mt-2 text-left ${location.pathname === "/funciones/wifi-qr" ? "font-bold text-black" : "text-gray-700"}`}
                    >
                      WiFi a QR
                    </button>
                  </div>
                  <button
                    onClick={()=>{ logout(); navigate("/login", { replace: true }); }}
                    className="w-full bg-red-50 text-red-600 font-semibold py-2 rounded-lg"
                  >
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
        </nav>
    );
}
