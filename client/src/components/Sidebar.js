// src/components/Sidebar.js
import React from "react";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  { name: "Dashboard", path: "/" },
  { name: "Stocks", path: "/stocks" },
  { name: "Batches", path: "/batches" },
  { name: "Transactions", path: "/transactions" },
  { name: "Alerts", path: "/alerts" },
  { name: "Settings", path: "/settings" },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="w-64 h-screen bg-white shadow-md p-5 border-r">
      <h2 className="text-2xl font-bold text-blue-700 mb-6">MilkChain</h2>
      <ul className="space-y-4">
        {menuItems.map((item) => (
          <li key={item.name}>
            <Link
              to={item.path}
              className={`block px-4 py-2 rounded-lg hover:bg-blue-100 transition ${
                location.pathname === item.path ? "bg-blue-200 font-semibold" : ""
              }`}
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
