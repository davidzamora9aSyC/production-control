import { useState } from "react";

export default function ModalCargarCSV({ titulo, onClose, onUpload }) {
  const [archivo, setArchivo] = useState(null);

  const handleArchivoChange = (e) => {
    setArchivo(e.target.files[0]);
  };

  const handleUpload = () => {
    if (archivo) {
      onUpload(archivo);
      onClose();
    }
    
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
        <h2 className="text-xl font-semibold mb-4">{titulo}</h2>
        <input
          type="file"
          accept=".csv"
          onChange={handleArchivoChange}
          className="mb-4"
        />
        {archivo && <div className="mb-4 text-sm text-gray-700">Archivo: {archivo.name}</div>}
        <div className="flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Cancelar</button>
          <button onClick={handleUpload} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" disabled={!archivo}>Cargar archivo</button>
        </div>
      </div>
    </div>
  );
}