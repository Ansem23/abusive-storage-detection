import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from "../context/AppContext";

const LandingPage = () => {
  const navigate = useNavigate();
  const { connectWallet } = useAppContext();

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-black"
      onClick={() => connectWallet()}
    >
      <div className="text-center space-y-6 cursor-pointer hover:scale-105 transition-transform duration-300">
        <img
          src="/stockguardlogo.png"
          alt="MilkChain Logo"
          className="w-32 h-32 mx-auto rounded-full shadow-2xl"
        />
        <h1 className="text-5xl font-bold text-white mb-4">Welcome to stockguard
        </h1>
        <p className="text-xl text-blue-200 mb-8">
          Secure Supply Chain Management System
        </p>
        <div className="animate-bounce text-blue-200 text-sm">
          Click anywhere to continue
        </div>
      </div>
    </div>
  );
};

export default LandingPage;