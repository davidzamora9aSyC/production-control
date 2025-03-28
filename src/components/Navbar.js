import { Link, useLocation, useNavigate } from "react-router-dom";
import logoNavbar from "../assets/logoNavbar.png";


export default function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();

    const links = [
        { path: "/dashboard", label: "Resumen General" },
        { path: "/recursos", label: "Recursos" },
        { path: "/ordenes", label: "Órdenes de producción" },
        { path: "/alertas", label: "Alertas" },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-4 border-b bg-white">
            <span onClick={() => navigate("/dashboard")} className="cursor-pointer">
                <img src={logoNavbar} alt="Logo" className="h-12" />
            </span>
            <ul className="flex gap-20 ml-12 text-lg">
                
                {links.map(link => (
                    <li key={link.path}>
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
