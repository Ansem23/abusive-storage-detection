import React from "react";
import { useNavigate } from "react-router-dom";
import AuthorityDashboard from "./AuthorityDashboard";
import ProducerDashboard from "./ProducerDashboard";
import ResellerDashboard from "./ResellerDashboard";
import { useAppContext } from "../context/AppContext";

const RoleBasedDashboard = () => {
  const { role, connectWallet } = useAppContext();

  if (!role) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="mb-4">Please connect your wallet to continue.</p>
        <button
          onClick={connectWallet}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-900 via-blue-800 to-black">
      {/* Add margin to move the welcome bar further down */}
      <div className="bg-blue-800 text-white text-center py-4 mb-8 mt-12 shadow-lg">
        <h1 className="text-2xl font-bold">
          Welcome to Dashboard ({role.charAt(0).toUpperCase() + role.slice(1)})
        </h1>
      </div>
      {/* Dashboard content */}
      <div className="p-6">
        {role === "producer" ? (
          <ProducerDashboard />)
          :role === "reseller" ? (
            <ResellerDashboard />
        ) : role === "admin" ? (
          <AuthorityDashboard />
        ) : (
          <div>Unauthorized: Invalid role</div>
        )}
      </div>
    </div>
  );
};

export default RoleBasedDashboard;