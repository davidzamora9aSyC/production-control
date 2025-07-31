import React from 'react';

export default function ErrorPopup({ mensaje, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md max-w-md">
        <p className="mb-4">{mensaje}</p>
        <div className="text-right">
          <button onClick={onClose} className="bg-blue-600 text-white px-4 py-2 rounded">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
