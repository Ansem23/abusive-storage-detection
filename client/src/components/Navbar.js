import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ethers } from "ethers";
import { useAppContext } from "../context/AppContext";
import MilkSupplyChain from "../contracts/MilkSupplyChain.json";
import {
  LayoutDashboard,
  PackageCheck,
  PackageSearch,
  ArrowRightLeft,
  AlertTriangle,
  Settings as SettingsIcon,
} from "lucide-react";
import { useAdmin } from '../context/AdminContext';

const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={24} /> },
  { name: "Transactions", path: "/transactions", icon: <ArrowRightLeft size={24} /> },
  { name: "Alerts", path: "/alerts", icon: <AlertTriangle size={24} /> },
];

const Navbar = () => {
  const { role } = useAppContext(); // Use AppContext to get the role
  const location = useLocation();
  const { isAdmin, setIsAdmin } = useAdmin(); // Destructure both isAdmin and setIsAdmin
  const contractAddress = "0x478d6EA83cF94Db5EE4cA91EA138F5a9b65a1A49";
  const contractABI = MilkSupplyChain.abi;

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        if (!window.ethereum) return;

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const userAddress = await signer.getAddress();

        const milkContract = new ethers.Contract(contractAddress, contractABI, signer);
        const adminStatus = await milkContract.isAdmin(userAddress);
        setIsAdmin(adminStatus);
      } catch (err) {
        console.error("Error checking admin role:", err);
      }
    };

    checkAdmin();
  }, [setIsAdmin]); // Add setIsAdmin to dependency array

  return (
    <nav
      className="fixed top-0 left-0 w-full z-30 bg-gradient-to-r from-blue-900 via-blue-800 to-black bg-opacity-40 text-white shadow-lg h-28 flex items-center justify-between px-10"
      style={{ backdropFilter: "blur(25px)" }} // Stronger blur effect for transparency
    >
      {/* Logo and Title */}
      <div className="flex items-center space-x-6">
        <img
          src="/stockguardlogo.png"
          alt="MilkChain"
          className="h-20 w-20 rounded-full"
        />
        <h2 className="text-4xl font-bold">MilkChain</h2>
      </div>

      {/* Menu Items */}
      <div className="flex space-x-10">
        {menuItems.map((item) => {
          // Role-based filtering
          if (role === "admin" && (item.path === "/stocks" || item.path === "/batches")) {
            return null;
          }
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-5 py-3 rounded-md hover:bg-blue-700 transition-all ${
                location.pathname === item.path ? "bg-blue-700 font-semibold" : "bg-transparent"
              }`}
            >
              {item.icon}
              <span className="text-xl">{item.name}</span>
            </Link>
          );
        })}
        {isAdmin && (
          <Link
            to="/settings"
            className={`flex items-center gap-3 px-5 py-3 rounded-md hover:bg-blue-700 transition-all ${
              location.pathname === "/settings" ? "bg-blue-700 font-semibold" : "bg-transparent"
            }`}
          >
            <SettingsIcon size={24} />
            <span className="text-xl">Settings</span>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
