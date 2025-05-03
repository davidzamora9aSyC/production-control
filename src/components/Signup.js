import { useState } from "react";
import { Link } from "react-router-dom";

export default function Signup() {
    const [user, setUser] = useState("");
    const [pass, setPass] = useState("");
    const [confirmPass, setConfirmPass] = useState("");

    return (
        <div className="min-h-screen bg-white p-20">
            <div className="mx-auto max-w-3xl">
                <img src={require("../assets/logo2.png")} alt="Logo" className="w-full mb-6" />
            </div>

            <div className="flex items-center justify-center mt-32 text-xl">
                <div className="w-full max-w-md px-4">
                    <h2 className="text-2xl font-bold mb-12 text-center">Crear una cuenta</h2>

                    <label className="block text-left mb-1">Usuario</label>
                    <input type="text" value={user} onChange={e => setUser(e.target.value)} className="w-full p-4 mb-6 rounded-full bg-gray-200 outline-none" />

                    <label className="block text-left mb-1">Contraseña</label>
                    <input type="password" value={pass} onChange={e => setPass(e.target.value)} className="w-full p-4 mb-6 rounded-full bg-gray-200 outline-none" />

                    <label className="block text-left mb-1">Repetir contraseña</label>
                    <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} className="w-full p-4 mb-10 rounded-full bg-gray-200 outline-none" />

                    <button className="w-full bg-black text-white p-4 rounded-full">Crear cuenta</button>
                    <Link to="/" className="block mt-4 text-blue-700 text-sm text-center">Crear nueva minuta</Link>
                </div>
            </div>
        </div>
    );
}
