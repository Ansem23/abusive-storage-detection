/*import React from "react";

const Settings = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">⚙️ Settings</h2>

      <div className="grid gap-4">
        <div className="bg-white p-4 shadow rounded">
          <h3 className="font-bold mb-2">Notification Threshold</h3>
          <input
            type="number"
            placeholder="Set abusive stock limit"
            className="border border-gray-300 p-2 rounded w-full"
          />
        </div>

        <div className="bg-white p-4 shadow rounded">
          <h3 className="font-bold mb-2">Account Management</h3>
          <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
            Remove My Admin Role
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;*/
import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';
import Web3 from 'web3';

// Contract ABI - only including the functions we need for role management
const contractABI = [
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "isAdmin",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "isProducer",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "isReseller",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "maxQuantityPerReseller",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "blacklistedHolders",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "addAdmin",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "removeAdmin",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "account", "type": "address"},
      {"internalType": "uint256", "name": "maxQuantity", "type": "uint256"}
    ],
    "name": "setReseller",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "account", "type": "address"},
      {"internalType": "uint256", "name": "maxQuantity", "type": "uint256"}
    ],
    "name": "changeMaxQuantityReseller",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "removeReseller",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "setProducer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "removeProducer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "holder", "type": "address"}],
    "name": "removeFromBlacklist",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const Settings = () => {
  // State management
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [currentAccount, setCurrentAccount] = useState('');
  const [address, setAddress] = useState('');
  const [addressRoles, setAddressRoles] = useState({
    isAdmin: false,
    isProducer: false,
    isReseller: false,
    maxQuantity: 0,
    isBlacklisted: false
  });
  const [loading, setLoading] = useState(false);
  const [actionStatus, setActionStatus] = useState({ type: '', message: '' });
  const [addressChecked, setAddressChecked] = useState(false);
  const [newMaxQuantity, setNewMaxQuantity] = useState(0);

  // Connect to Web3 and initialize the contract
  useEffect(() => {
    const initWeb3 = async () => {
      try {
        // Initialize Web3 with Ganache RPC
        const web3Instance = new Web3('http://127.0.0.1:7545');
        setWeb3(web3Instance);
        
        // Get accounts
        const accts = await web3Instance.eth.getAccounts();
        setAccounts(accts);
        setCurrentAccount(accts[0]);
        
        // Initialize contract instance
        const contractAddress = '0xDef6807E1bCB95AcB17aCB348a6B2B5aA12aE1c0';
        const contractInstance = new web3Instance.eth.Contract(contractABI, contractAddress);
        setContract(contractInstance);
        
        setActionStatus({
          type: 'success',
          message: 'Connected to Ganache successfully'
        });
      } catch (error) {
        console.error("Error initializing Web3:", error);
        setActionStatus({
          type: 'error',
          message: `Failed to connect to Ganache: ${error.message}`
        });
      }
    };
    
    initWeb3();
  }, []);

  // Check roles from blockchain
  const checkRoles = async () => {
    if (!web3 || !contract) {
      setActionStatus({
        type: 'error',
        message: 'Web3 not initialized. Please refresh the page.'
      });
      return;
    }
    
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      setActionStatus({
        type: 'error',
        message: 'Please enter a valid Ethereum address'
      });
      return;
    }

    setLoading(true);
    
    try {
      // Call contract methods to get role information
      const [isAdmin, isProducer, isReseller, maxQuantity, isBlacklisted] = await Promise.all([
        contract.methods.isAdmin(address).call(),
        contract.methods.isProducer(address).call(),
        contract.methods.isReseller(address).call(),
        contract.methods.maxQuantityPerReseller(address).call(),
        contract.methods.blacklistedHolders(address).call()
      ]);
      
      setAddressRoles({
        isAdmin,
        isProducer,
        isReseller,
        maxQuantity: parseInt(maxQuantity),
        isBlacklisted
      });
      
      setAddressChecked(true);
      setActionStatus({
        type: 'success',
        message: 'Address roles retrieved successfully'
      });
    } catch (error) {
      console.error("Error checking roles:", error);
      setActionStatus({
        type: 'error',
        message: `Failed to check roles: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  // Add admin role
  const addAdmin = async () => {
    if (!contract || !currentAccount) return;
    
    setLoading(true);
    try {
      await contract.methods.addAdmin(address).send({ from: currentAccount });
      setAddressRoles(prev => ({ ...prev, isAdmin: true }));
      setActionStatus({
        type: 'success',
        message: 'Admin role added successfully'
      });
    } catch (error) {
      console.error("Error adding admin:", error);
      setActionStatus({
        type: 'error',
        message: `Failed to add admin: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  // Remove admin role
  const removeAdmin = async () => {
    if (!contract || !currentAccount) return;
    
    setLoading(true);
    try {
      await contract.methods.removeAdmin(address).send({ from: currentAccount });
      setAddressRoles(prev => ({ ...prev, isAdmin: false }));
      setActionStatus({
        type: 'success',
        message: 'Admin role removed successfully'
      });
    } catch (error) {
      console.error("Error removing admin:", error);
      setActionStatus({
        type: 'error',
        message: `Failed to remove admin: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  // Add producer role
  const addProducer = async () => {
    if (!contract || !currentAccount) return;
    
    setLoading(true);
    try {
      await contract.methods.setProducer(address).send({ from: currentAccount });
      setAddressRoles(prev => ({ ...prev, isProducer: true }));
      setActionStatus({
        type: 'success',
        message: 'Producer role added successfully'
      });
    } catch (error) {
      console.error("Error adding producer:", error);
      setActionStatus({
        type: 'error',
        message: `Failed to add producer: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  // Remove producer role
  const removeProducer = async () => {
    if (!contract || !currentAccount) return;
    
    setLoading(true);
    try {
      await contract.methods.removeProducer(address).send({ from: currentAccount });
      setAddressRoles(prev => ({ ...prev, isProducer: false }));
      setActionStatus({
        type: 'success',
        message: 'Producer role removed successfully'
      });
    } catch (error) {
      console.error("Error removing producer:", error);
      setActionStatus({
        type: 'error',
        message: `Failed to remove producer: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  // Add reseller role
  const addReseller = async () => {
    if (!contract || !currentAccount) return;
    
    setLoading(true);
    try {
      await contract.methods.setReseller(address, newMaxQuantity).send({ from: currentAccount });
      setAddressRoles(prev => ({ 
        ...prev, 
        isReseller: true,
        maxQuantity: newMaxQuantity
      }));
      setActionStatus({
        type: 'success',
        message: 'Reseller role added successfully'
      });
    } catch (error) {
      console.error("Error adding reseller:", error);
      setActionStatus({
        type: 'error',
        message: `Failed to add reseller: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  // Remove reseller role
  const removeReseller = async () => {
    if (!contract || !currentAccount) return;
    
    setLoading(true);
    try {
      await contract.methods.removeReseller(address).send({ from: currentAccount });
      setAddressRoles(prev => ({ ...prev, isReseller: false }));
      setActionStatus({
        type: 'success',
        message: 'Reseller role removed successfully'
      });
    } catch (error) {
      console.error("Error removing reseller:", error);
      setActionStatus({
        type: 'error',
        message: `Failed to remove reseller: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  // Update max quantity for reseller
  const updateMaxQuantity = async () => {
    if (!contract || !currentAccount) return;
    
    setLoading(true);
    try {
      await contract.methods.changeMaxQuantityReseller(address, newMaxQuantity).send({ from: currentAccount });
      setAddressRoles(prev => ({ ...prev, maxQuantity: newMaxQuantity }));
      setActionStatus({
        type: 'success',
        message: `Max quantity updated to ${newMaxQuantity}`
      });
    } catch (error) {
      console.error("Error updating max quantity:", error);
      setActionStatus({
        type: 'error',
        message: `Failed to update max quantity: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  // Remove from blacklist
  const removeFromBlacklist = async () => {
    if (!contract || !currentAccount) return;
    
    setLoading(true);
    try {
      await contract.methods.removeFromBlacklist(address).send({ from: currentAccount });
      setAddressRoles(prev => ({ ...prev, isBlacklisted: false }));
      setActionStatus({
        type: 'success',
        message: 'Address removed from blacklist'
      });
    } catch (error) {
      console.error("Error removing from blacklist:", error);
      setActionStatus({
        type: 'error',
        message: `Failed to remove from blacklist: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  // Reset the form
  const resetForm = () => {
    setAddress('');
    setAddressRoles({
      isAdmin: false,
      isProducer: false,
      isReseller: false,
      maxQuantity: 0,
      isBlacklisted: false
    });
    setAddressChecked(false);
    setActionStatus({ type: '', message: '' });
    setNewMaxQuantity(0);
  };

  // Handle account change
  const handleAccountChange = (e) => {
    setCurrentAccount(e.target.value);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Milk Supply Chain Role Management</h1>
      
      {/* Connection Status */}
      <div className="mb-4 flex items-center">
        <span className={`inline-block w-3 h-3 rounded-full mr-2 ${web3 ? 'bg-green-500' : 'bg-red-500'}`}></span>
        <span className="text-sm font-medium">
          {web3 ? 'Connected to Ganache' : 'Not connected to Ganache'}
        </span>
      </div>
      
      {/* Account Selector */}
      {accounts.length > 0 && (
        <div className="mb-6">
          <label htmlFor="account" className="block text-sm font-medium text-gray-700 mb-1">
            Select Your Account (For Transactions)
          </label>
          <select
            id="account"
            value={currentAccount}
            onChange={handleAccountChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            {accounts.map((account, index) => (
              <option key={index} value={account}>
                {account}
              </option>
            ))}
          </select>
        </div>
      )}
      
      {/* Alert for action status */}
      {actionStatus.message && (
        <div className={`mb-4 p-4 rounded-md flex items-center justify-between ${
          actionStatus.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
        }`}>
          <div className="flex items-center">
            {actionStatus.type === 'error' ? (
              <AlertCircle className="h-5 w-5 mr-2" />
            ) : (
              <CheckCircle className="h-5 w-5 mr-2" />
            )}
            <span>{actionStatus.message}</span>
          </div>
          <button onClick={() => setActionStatus({ type: '', message: '' })}>
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
      
      {/* Address input section */}
      <div className="mb-6">
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
          Check Address Roles
        </label>
        <div className="flex">
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x..."
            className="flex-1 p-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={checkRoles}
            disabled={loading || !web3}
            className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? 'Checking...' : 'Check Roles'}
          </button>
        </div>
      </div>
      
      {/* Role display and management section */}
      {addressChecked && (
        <div className="border rounded-md p-4 mb-6">
          <h2 className="text-lg font-semibold mb-4">Current Roles for {address.substring(0, 6)}...{address.substring(address.length - 4)}</h2>
          
          {addressRoles.isBlacklisted && (
            <div className="bg-red-100 text-red-800 p-3 mb-4 rounded-md flex justify-between items-center">
              <span className="font-medium">⚠️ This address is blacklisted</span>
              <button
                onClick={removeFromBlacklist}
                disabled={loading || !web3}
                className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 disabled:bg-red-300 text-sm"
              >
                Remove from Blacklist
              </button>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Admin Role */}
            <div className="border rounded-md p-3">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Admin</h3>
                  <p className="text-sm text-gray-600">Current status: {addressRoles.isAdmin ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <button
                    onClick={addAdmin}
                    disabled={addressRoles.isAdmin || loading || !web3}
                    className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 disabled:bg-green-300 text-sm mr-2"
                  >
                    Add
                  </button>
                  <button
                    onClick={removeAdmin}
                    disabled={!addressRoles.isAdmin || loading || !web3}
                    className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 disabled:bg-red-300 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
            
            {/* Producer Role */}
            <div className="border rounded-md p-3">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Producer</h3>
                  <p className="text-sm text-gray-600">Current status: {addressRoles.isProducer ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <button
                    onClick={addProducer}
                    disabled={addressRoles.isProducer || addressRoles.isBlacklisted || loading || !web3}
                    className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 disabled:bg-green-300 text-sm mr-2"
                  >
                    Add
                  </button>
                  <button
                    onClick={removeProducer}
                    disabled={!addressRoles.isProducer || loading || !web3}
                    className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 disabled:bg-red-300 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
            
            {/* Reseller Role */}
            <div className="border rounded-md p-3">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h3 className="font-medium">Reseller</h3>
                  <p className="text-sm text-gray-600">Current status: {addressRoles.isReseller ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <button
                    onClick={addReseller}
                    disabled={addressRoles.isReseller || addressRoles.isBlacklisted || loading || !web3}
                    className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 disabled:bg-green-300 text-sm mr-2"
                  >
                    Add
                  </button>
                  <button
                    onClick={removeReseller}
                    disabled={!addressRoles.isReseller || loading || !web3}
                    className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 disabled:bg-red-300 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
              
              {/* Max Quantity Management */}
              <div className="mt-2 border-t pt-2">
                <p className="text-sm mb-2">Max Quantity: {addressRoles.maxQuantity}</p>
                <div className="flex">
                  <input
                    type="number"
                    min="0"
                    value={newMaxQuantity}
                    onChange={(e) => setNewMaxQuantity(parseInt(e.target.value) || 0)}
                    className="w-24 p-1 border border-gray-300 rounded-l-md text-sm"
                  />
                  <button
                    onClick={updateMaxQuantity}
                    disabled={!addressRoles.isReseller || loading || !web3}
                    className="bg-blue-600 text-white px-2 py-1 rounded-r-md hover:bg-blue-700 disabled:bg-blue-300 text-sm"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <button
            onClick={resetForm}
            className="mt-4 w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
          >
            Reset
          </button>
        </div>
      )}
      
      <div className="mt-6 text-sm text-gray-600">
        <h3 className="font-medium mb-2">About Role Management</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Admins can manage all roles and resolve violations</li>
          <li>Producers can create new milk batches in the supply chain</li>
          <li>Resellers can receive and transfer milk batches with a maximum quantity limit</li>
          <li>Blacklisted addresses cannot participate in the supply chain due to violations</li>
        </ul>
      </div>
    </div>
  );
};

export default Settings;