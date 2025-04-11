import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div 
            className="flex items-center space-x-3 cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <img
              src="/stockguardlogo.png"
              alt="StockGuard"
              className="h-10 w-10"
            />
            <span className="text-xl font-bold text-blue-800 hover:text-blue-600">
              StockGuard
            </span>
          </div>
          
          <div className="flex space-x-4">
            <button 
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-blue-600"
            >
              Dashboard
            </button>
            <button 
              onClick={() => navigate('/transactions')}
              className="text-gray-600 hover:text-blue-600"
            >
              Transactions
            </button>
            <button 
              onClick={() => navigate('/settings')}
              className="text-gray-600 hover:text-blue-600"
            >
              Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;