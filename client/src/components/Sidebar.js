import React, { useState, useContext, createContext } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  PackageCheck,
  PackageSearch,
  ArrowRightLeft,
  AlertTriangle,
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Create a context for sidebar state
export const SidebarContext = createContext();

const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={18} /> },
  { name: "Stocks", path: "/stocks", icon: <PackageCheck size={18} /> },
  { name: "Batches", path: "/batches", icon: <PackageSearch size={18} /> },
  { name: "Transactions", path: "/transactions", icon: <ArrowRightLeft size={18} /> },
  { name: "Alerts", path: "/alerts", icon: <AlertTriangle size={18} /> },
  { name: "Settings", path: "/settings", icon: <SettingsIcon size={18} /> },
];

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  return (
    <SidebarContext.Provider value={isCollapsed}>
      <aside
        className={`
          fixed top-0 left-0 h-screen z-30
          bg-gradient-to-b from-blue-900 via-blue-800 to-black 
          text-white shadow-lg flex flex-col
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-64'}
        `}
      >
        {/* Logo / Branding */}
        <div className="p-4 flex items-center space-x-2 border-b border-blue-700">
          <img
            src="/stockguardlogo.png"
            alt="MilkChain"
            className="h-10 w-10 rounded-full"
          />
          {!isCollapsed && <h2 className="text-lg font-bold">MilkChain</h2>}
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 bg-blue-800 rounded-full p-1.5 hover:bg-blue-700 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-md 
                hover:bg-blue-700 transition-all 
                ${location.pathname === item.path ? 'bg-blue-700 font-semibold' : 'bg-transparent'}
              `}
            >
              {item.icon}
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="p-4 text-xs text-center text-gray-400">
            © 2025 MilkChain
          </div>
        )}
      </aside>
    </SidebarContext.Provider>
  );
};

export default Sidebar;