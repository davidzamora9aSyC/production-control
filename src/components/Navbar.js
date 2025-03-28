import { Link, useLocation, useNavigate } from "react-router-dom";
import logoNavbar from "../assets/logoNavbar.png";


export default function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();

    const links = [
        { path: "/", label: "Resumen General" },
        { path: "/recursos", label: "Recursos" },
        { path: "/ordenes", label: "Órdenes de producción" },
        { path: "/alertas", label: "Alertas" },
    ];

    return (
        <nav className="flex justify-between items-center px-6 py-4 border-b">
            <img src={logoNavbar} alt="Logo" className="h-12" />
            <ul className="flex gap-20 ml-12 text-lg">
                
                {links.map(link => (
                    <li key={link.path}>
                        <Link
                            to={link.path}
                            className={`${
                                location.pathname === link.path
                                    ? "font-bold text-black text-xl"
                                    : "text-gray-600 text-xl font-semibold"
                            }`}
                        >
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
            <button onClick={()=>navigate("/")} className="text-xl font-bold">Cerrar sesión</button>
        </nav>
    );
}
