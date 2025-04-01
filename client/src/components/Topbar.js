import React from "react";

function Topbar() {
  return (
    <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
      <h2 className="text-xl font-semibold">Bienvenue 👋</h2>
      <div className="text-sm text-gray-600">Rôle : Admin</div>
    </header>
  );
}

export default Topbar;
