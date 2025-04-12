import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import Sidebar from "../components/Sidebar"; // Import the Sidebar component

// Contract ABI for role management
const contractABI = [
  "function isAdmin(address) view returns (bool)",
  "function isProducer(address) view returns (bool)",
  "function isReseller(address) view returns (bool)",
  "function blacklistedHolders(address) view returns (bool)",
  "function addAdmin(address)",
  "function removeAdmin(address)",
  "function setProducer(address)",
  "function removeProducer(address)",
  "function setReseller(address, uint256)",
  "function removeReseller(address)",
  "function changeMaxQuantityReseller(address, uint256)",
  "function removeFromBlacklist(address)"
];

const Settings = () => {
  const [account, setAccount] = useState(""); // Connected account from Ganache
  const [contract, setContract] = useState(null);
  const [address, setAddress] = useState("");
  const [addressRoles, setAddressRoles] = useState({
    isAdmin: false,
    isProducer: false,
    isReseller: false,
    isBlacklisted: false,
    maxQuantity: 0
  });
  const [actionStatus, setActionStatus] = useState({ type: "", message: "" });
  const [roleMessage, setRoleMessage] = useState(""); // Role message beside the button
  const [newMaxQuantity, setNewMaxQuantity] = useState("");
  const [loading, setLoading] = useState(false);

  const contractAddress = "0x5304790909ba6a19f33C6BC2407a106c77E23BEf"; // Contract address
  const ganacheRPC = "http://127.0.0.1:7545"; // Ganache RPC URL
  const privateKey = "0x96e74f63173302c1dd6c9ee7da33e03c91da7d763b5beb0907b87ecb3ba7a7479e"; // Replace with a private key from Ganache

  // Initialize the contract and connect to Ganache
  useEffect(() => {
    const init = async () => {
      try {
        // Connect to Ganache
        const provider = new ethers.providers.JsonRpcProvider(ganacheRPC);
        const wallet = new ethers.Wallet(privateKey, provider);

        setAccount(wallet.address); // Set the connected account address

        const milkContract = new ethers.Contract(contractAddress, contractABI, wallet);
        setContract(milkContract);
      } catch (err) {
        console.error("Initialization error:", err);
        setActionStatus({ type: "error", message: `Failed to connect: ${err.message}` });
      }
    };

    init();
  }, [contractAddress, ganacheRPC, privateKey]);

  // Check roles for a specific address
  const checkRoles = async () => {
    if (!ethers.utils.isAddress(address)) {
      setActionStatus({ type: "error", message: "Invalid address" });
      setRoleMessage(""); // Clear role message
      return;
    }

    try {
      setLoading(true);
      const isAdmin = await contract.isAdmin(address);
      const isProducer = await contract.isProducer(address);
      const isReseller = await contract.isReseller(address);
      const isBlacklisted = await contract.blacklistedHolders(address);

      setAddressRoles({
        isAdmin,
        isProducer,
        isReseller,
        isBlacklisted,
        maxQuantity: 0 // Add logic for maxQuantity if needed
      });

      // Determine the role based on the flags
      let role = "No specific role";
      if (isAdmin) role = "Admin";
      else if (isProducer) role = "Producer";
      else if (isReseller) role = "Reseller";
      else if (isBlacklisted) role = "Blacklisted";

      setRoleMessage(role); // Set the role message beside the button
    } catch (err) {
      console.error("Error checking roles:", err);
      setActionStatus({ type: "error", message: `Failed to check roles: ${err.message}` });
      setRoleMessage(""); // Clear role message on error
    } finally {
      setLoading(false);
    }
  };

  // Generic function to handle role management actions
  const handleRoleAction = async (action, params = []) => {
    if (!contract || !address) {
      setActionStatus({ type: "error", message: "Contract not initialized or address is empty" });
      return;
    }

    try {
      setLoading(true);
      const tx = await contract[action](...params);
      await tx.wait();
      setActionStatus({ type: "success", message: `${action} executed successfully` });
    } catch (err) {
      console.error(`Error executing ${action}:`, err);
      setActionStatus({ type: "error", message: `Failed to execute ${action}: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-blue-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center bg-blue-300">
        {/* Top Section */}
        <div className="flex justify-end items-center px-6 py-4 w-full">
          <div className="text-sm text-gray-600 bg-white rounded-lg px-4 py-2 shadow">
            <span className="font-semibold">Connected Account:</span>{" "}
            <span className="text-blue-600 font-semibold">{account}</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 w-full max-w-4xl bg-white rounded-xl shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Admin Panel</h1>

          {/* Check Roles Section */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">Check Roles</h2>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
                placeholder="Enter address (0x...)"
              />
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={checkRoles}
                className="bg-blue-800 hover:bg-blue-900 text-white py-2 px-4 rounded"
              >
                {loading ? "Checking..." : "Check Roles"}
              </button>
              {roleMessage && (
                <span className="text-gray-700 font-semibold">{`Role: ${roleMessage}`}</span>
              )}
            </div>
          </div>

          {/* Role Management Section */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">Manage Roles</h2>
            <div className="flex justify-center space-x-4 mb-4">
              <button
                onClick={() => handleRoleAction("addAdmin", [address])}
                className="bg-blue-800 hover:bg-blue-900 text-white py-2 px-4 rounded"
              >
                Add Admin
              </button>
              <button
                onClick={() => handleRoleAction("removeAdmin", [address])}
                className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
              >
                Remove Admin
              </button>
            </div>
            <div className="flex justify-center space-x-4 mb-4">
              <button
                onClick={() => handleRoleAction("setProducer", [address])}
                className="bg-blue-800 hover:bg-blue-900 text-white py-2 px-4 rounded"
              >
                Add Producer
              </button>
              <button
                onClick={() => handleRoleAction("removeProducer", [address])}
                className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
              >
                Remove Producer
              </button>
            </div>
            <div className="flex justify-center space-x-4 mb-4">
              <button
                onClick={() => handleRoleAction("setReseller", [address, newMaxQuantity])}
                className="bg-blue-800 hover:bg-blue-900 text-white py-2 px-4 rounded"
              >
                Add Reseller
              </button>
              <button
                onClick={() => handleRoleAction("removeReseller", [address])}
                className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
              >
                Remove Reseller
              </button>
            </div>
          </div>

          {/* Action Status */}
          {actionStatus.message && (
            <div
              className={`p-4 rounded ${
                actionStatus.type === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {actionStatus.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;