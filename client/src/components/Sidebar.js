import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaTachometerAlt, FaBox, FaLayerGroup, FaExchangeAlt, FaBell, FaCog ,FaUserShield} from "react-icons/fa";

const menuItems = [
  { name: "Dashboard", path: "/", icon: <FaTachometerAlt /> },
  { name: "Stocks", path: "/stocks", icon: <FaBox /> },
  { name: "Batches", path: "/batches", icon: <FaLayerGroup /> },
  { name: "Transactions", path: "/transactions", icon: <FaExchangeAlt /> },
  { name: "Alerts", path: "/alerts", icon: <FaBell /> },
  { name: "adminpannel", path: "/settings", icon: <FaUserShield/> },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="w-20 h-screen bg-white dark:bg-darkBlue text-gray-800 dark:text-white shadow-md p-3 border-r dark:border-gray-700 fixed top-0 left-0 flex flex-col items-center">
      {/* Logo Section */}
      <Link to="/" className="mb-6">
        <img
          src="/stockguardlogo.png" // Replace with the path to your logo
          alt="Logo"
          className="w-12 h-12"
        />
      </Link>

      {/* Menu Items */}
      <ul className="space-y-6">
        {menuItems.map((item) => (
          <li key={item.name} className="relative group">
            <Link
              to={item.path}
              className={`flex justify-center items-center w-12 h-12 rounded-lg hover:bg-lightBlue dark:hover:bg-gray-600 transition ${
                location.pathname === item.path ? "bg-lightBlue dark:bg-gray-700" : ""
              }`}
            >
              {item.icon}
            </Link>
            {/* Tooltip */}
            <span className="absolute left-14 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition">
              {item.name}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;