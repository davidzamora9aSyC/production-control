import { useNavigate } from "react-router-dom";
import WifiQrGenerator from "../components/WifiQrGenerator";

export default function WifiQrTool() {
  const navigate = useNavigate();

  return (
    <div className="bg-white min-h-screen animate-slideLeft">
      <div className="px-6 md:px-16 pt-10 pb-16 max-w-5xl mx-auto space-y-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-blue-600 text-lg hover:underline"
        >
          &larr; Volver
        </button>
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Convertir WiFi a QR</h1>
          <p className="text-gray-600 mt-1">
            Genera identificadores rápidos para que la tolva se conecte a una nueva red WiFi.
          </p>
        </div>
        <WifiQrGenerator />
      </div>
    </div>
  );
}
