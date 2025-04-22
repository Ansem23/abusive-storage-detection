// client/src/pages/Settings.js
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import MilkSupplyChain from "../contracts/MilkSupplyChain.json";

const contractABI = MilkSupplyChain.abi;

const Settings = () => {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [address, setAddress] = useState("");
  const [addressRoles, setAddressRoles] = useState({
    isAdmin: false,
    isProducer: false,
    isReseller: false,
    isBlacklisted: false,
    maxQuantity: 0,
  });
  const [actionStatus, setActionStatus] = useState({ type: "", message: "" });
  const [roleMessage, setRoleMessage] = useState("");
  const [newMaxQuantity, setNewMaxQuantity] = useState("");
  const [loading, setLoading] = useState(false);

  // Votre adresse de contrat / RPC / clé privée
  const contractAddress = "0x4EebE79FbD9d69c964A035857dF0f422a9C5a385";
  const ganacheRPC = "http://127.0.0.1:7545";
  // Initialisation du contrat et connexion
  useEffect(() => {
    const init = async () => {
      try {
        if (!window.ethereum) {
          setActionStatus({ type: "error", message: "MetaMask not detected" });
          return;
        }
  
        // Request account access
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const userAddress = await signer.getAddress();
        setAccount(userAddress);
  
        // Connect to contract with signer
        const milkContract = new ethers.Contract(contractAddress, contractABI, signer);
        setContract(milkContract);
      } catch (err) {
        console.error("MetaMask connection error:", err);
        setActionStatus({ type: "error", message: `Failed to connect MetaMask: ${err.message}` });
      }
    };
  
    init();
  }, []);
  

  // Vérification des rôles
  const checkRoles = async () => {
    if (!ethers.utils.isAddress(address)) {
      setActionStatus({ type: "error", message: "Invalid address" });
      setRoleMessage("");
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
        maxQuantity: 0,
      });

      let role = "No specific role";
      if (isAdmin) role = "Admin";
      else if (isProducer) role = "Producer";
      else if (isReseller) role = "Reseller";
      else if (isBlacklisted) role = "Blacklisted";

      setRoleMessage(role);
    } catch (err) {
      console.error("Error checking roles:", err);
      setActionStatus({ type: "error", message: `Failed to check roles: ${err.message}` });
      setRoleMessage("");
    } finally {
      setLoading(false);
    }
  };

  // Fonction générique pour les actions
  const handleRoleAction = async (action, params = []) => {
    if (!contract || !address) {
      setActionStatus({
        type: "error",
        message: "Contract not initialized or address is empty",
      });
      return;
    }

    try {
      setLoading(true);
      const tx = await contract[action](...params);
      await tx.wait();
      setActionStatus({ type: "success", message: `${action} executed successfully` });
    } catch (err) {
      console.error(`Error executing ${action}:`, err);
      setActionStatus({
        type: "error",
        message: `Failed to execute ${action}: ${err.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-blue-300">
      {/* Barre du haut */}
      <div className="flex justify-end items-center px-6 py-4 w-full">
        <div className="text-sm text-gray-600 bg-white rounded-lg px-4 py-2 shadow">
          <span className="font-semibold">Connected Account:</span>{" "}
          <span className="text-blue-600 font-semibold">{account}</span>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="p-6 w-full max-w-5xl bg-white rounded-xl shadow-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Admin Panel
        </h1>

        {/* Organisation en 2 colonnes */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Colonne gauche : Check Roles */}
          <div className="bg-gray-50 p-6 rounded shadow flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                Check Roles
              </h2>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">
                  Enter address (0x...)
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
                  placeholder="Enter address (0x...)"
                />
              </div>
            </div>
            <div>
              <button
                onClick={checkRoles}
                className="bg-blue-800 hover:bg-blue-900 text-white py-2 px-4 rounded 
                  transition-transform hover:scale-105 w-full"
              >
                {loading ? "Checking..." : "Check Roles"}
              </button>
              {roleMessage && (
                <span className="block text-gray-700 font-semibold mt-3 text-center">
                  Role: {roleMessage}
                </span>
              )}
            </div>
          </div>

          {/* Colonne droite : Manage Roles */}
          <div className="bg-gray-50 p-6 rounded shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
              Manage Roles
            </h2>
            {/* Grid 2 colonnes pour aligner les 6 boutons */}
            <div className="grid grid-cols-2 gap-4">
              {/* Admin */}
              <button
                onClick={() => handleRoleAction("addAdmin", [address])}
                className="bg-blue-800 hover:bg-blue-900 text-white py-2 px-4 rounded 
                  transition-transform hover:scale-105"
              >
                Add Admin
              </button>
              <button
                onClick={() => handleRoleAction("removeAdmin", [address])}
                className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded 
                  transition-transform hover:scale-105"
              >
                Remove Admin
              </button>

              {/* Producer */}
              <button
                onClick={() => handleRoleAction("setProducer", [address])}
                className="bg-blue-800 hover:bg-blue-900 text-white py-2 px-4 rounded 
                  transition-transform hover:scale-105"
              >
                Add Producer
              </button>
              <button
                onClick={() => handleRoleAction("removeProducer", [address])}
                className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded 
                  transition-transform hover:scale-105"
              >
                Remove Producer
              </button>

              {/* Reseller RANIM ZID INPUT BCH TATTIH MAXQUANTITY*/}
              <button
                onClick={() => handleRoleAction("setReseller", [address, newMaxQuantity])}
                className="bg-blue-800 hover:bg-blue-900 text-white py-2 px-4 rounded 
                  transition-transform hover:scale-105"
              > 
                Add Reseller
              </button>
              <button
                onClick={() => handleRoleAction("removeReseller", [address])}
                className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded 
                  transition-transform hover:scale-105"
              >
                Remove Reseller
              </button>
            </div>
          </div>
        </div>

        {/* Affichage des messages d’état (succès ou erreur) */}
        {actionStatus.message && (
          <div
            className={`mt-6 p-4 rounded ${
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
  );
};

export default Settings;
