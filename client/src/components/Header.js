// src/components/Header.js
import React from "react";

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-blue-900 to-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center space-x-3">
        {/* Logo */}
        <img
          src="/stockguardlogo.png"
          alt="StockGuard"
          className="h-10 w-10 rounded"
        />

        {/* Branding */}
        <h1 className="text-xl font-bold tracking-wide">
          StockGuard
        </h1>
      </div>
    </header>
  );
};

export default Header;
