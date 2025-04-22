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
    <div>
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
  );
};

export default RoleBasedDashboard;