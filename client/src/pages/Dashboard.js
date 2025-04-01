// client/src/pages/Dashboard.js
import React from "react";

const Dashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">📊 Tableau de bord</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-2xl shadow-lg">
          <h2 className="text-xl font-semibold">Total des lots</h2>
          <p className="text-3xl text-blue-600 font-bold mt-2">42</p>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-lg">
          <h2 className="text-xl font-semibold">Stock disponible</h2>
          <p className="text-3xl text-green-600 font-bold mt-2">1200L</p>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-lg">
          <h2 className="text-xl font-semibold">Alertes abusives</h2>
          <p className="text-3xl text-red-500 font-bold mt-2">3</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
