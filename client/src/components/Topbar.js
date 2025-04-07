import React from "react";

const Topbar = ({ account, role }) => {
  return (
    <div className="flex justify-between items-center bg-white px-6 py-4 shadow">
      <h2 className="text-xl font-semibold">Bienvenue 👋</h2>
      <div className="text-sm text-gray-600">
        Rôle : <span className="font-semibold">{role}</span> | Compte :{" "}
        <span className="text-green-600 font-semibold">{account}</span>
      </div>
    </div>
  );
};

export default Topbar;
