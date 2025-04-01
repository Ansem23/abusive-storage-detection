import React from "react";

function Sidebar() {
  return (
    <aside className="w-64 bg-white shadow-md h-full">
      <div className="p-6 font-bold text-lg text-blue-600">MilkChain</div>
      <nav className="px-4 space-y-2">
        <a href="#" className="block text-gray-700 hover:text-blue-500">
          🏠 Dashboard
        </a>
        <a href="#" className="block text-gray-700 hover:text-blue-500">
          📦 Stocks
        </a>
        <a href="#" className="block text-gray-700 hover:text-blue-500">
          🔁 Transactions
        </a>
        <a href="#" className="block text-gray-700 hover:text-blue-500">
          ⚙️ Paramètres
        </a>
      </nav>
    </aside>
  );
}

export default Sidebar;
