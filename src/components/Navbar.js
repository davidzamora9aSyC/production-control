import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import logoNavbar from "../assets/logoNavbar.png";


export default function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();

    const [dropdownAbierto, setDropdownAbierto] = useState(false);
    const dropdownRef = useRef();

    useEffect(() => {
      const handleClickOutside = (e) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
          setDropdownAbierto(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const links = [
        { path: "/dashboard", label: "Resumen General" },
        { path: "/ordenes", label: "Órdenes de producción" },
        { path: "/alertas", label: "Alertas" },
        { path: "/minuta", label: "Nueva minuta" },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-4 border-b bg-white">
            <span onClick={() => navigate("/dashboard")} className="cursor-pointer">
                <img src={logoNavbar} alt="Logo" className="h-12" />
            </span>
            <ul className="flex gap-16 ml-12 text-lg">
                <li key="recursos" className="relative" ref={dropdownRef}>
                  <span
                    onClick={() => setDropdownAbierto(prev => !prev)}
                    className={`cursor-pointer transition-colors duration-300 text-xl font-semibold text-gray-600 hover:text-black`}
                  >
                    Recursos
                  </span>
                  {dropdownAbierto && (
                    <ul className="absolute bg-white shadow-lg rounded mt-2 w-52 z-50">
                      {[
                        { path: "/recursos", label: "Recursos actuales" },
                        { path: "/recursos/personas", label: "Personas" },
                        { path: "/recursos/equipos", label: "Equipos" },
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
            </ul>
            <button onClick={()=>navigate("/")} className="text-xl font-bold">Cerrar sesión</button>
        </nav>
    );
}
