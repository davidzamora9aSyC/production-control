import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
    const [user, setUser] = useState("");
    const [pass, setPass] = useState("");
    const navigate = useNavigate();

    const handleLogin = () => {
        // Aquí puedes validar credenciales si quieres
        navigate("/dashboard");
    };

    return (
        <div className="min-h-screen bg-white p-20">
            <div className="mx-auto max-w-3xl">
                <img src={require("../assets/logo2.png")} alt="Logo" className="w-full mb-6" />
            </div>

            <div className="flex items-center justify-center mt-32 text-xl">
                <div className="w-full max-w-md px-4">
                    <h2 className="text-3xl font-bold mb-20 text-center">Ingresar a tu cuenta</h2>

                    <label className="block text-left mb-1 font-bold">Usuario</label>
                    <input type="text" value={user} onChange={e => setUser(e.target.value)} className="w-full p-4 mb-8 rounded-full bg-gray-200 outline-none" />

                    <label className="block text-left mb-1 font-bold">Contraseña</label>
                    <input type="password" value={pass} onChange={e => setPass(e.target.value)} className="w-full p-4 mb-8 rounded-full bg-gray-200 outline-none" />

                    <button onClick={handleLogin} className="w-full bg-black text-white p-4 rounded-full">Iniciar sesión</button>
                    <Link to="/register" className="block mt-4 text-blue-700 text-sm text-center">Aún no tengo cuenta</Link>
                    <Link to="/" className="block mt-4 text-blue-700 text-sm text-center">Crear nueva minuta</Link>
                </div>
            </div>
        </div>
    );
}
