import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import MilkSupplyChain from "../contracts/MilkSupplyChain.json";

const Stocks = () => {
  // State variables
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [userRoles, setUserRoles] = useState({ isAdmin: false, isProducer: false, isReseller: false });
  const [stockBalance, setStockBalance] = useState(0);
  const [maxQuantity, setMaxQuantity] = useState(0);
  const [batchIds, setBatchIds] = useState([]);
  const [batchDetails, setBatchDetails] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isBlacklisted, setIsBlacklisted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [transactionPending, setTransactionPending] = useState(false);
  
  // Form states
  const [produceQuantity, setProduceQuantity] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [transferQuantity, setTransferQuantity] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Contract address from your input
  const contractAddress = "0xFAcBc93EC946Ef2F709504F23eA41770a361A07e";

  // Initialize and connect to the contract
  useEffect(() => {
    const init = async () => {
      try {

        setErrorMessage('');
        setSuccessMessage('');
        setLoading(true);

        if (window.ethereum) {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const userAddress = await signer.getAddress();
          
          setAccount(userAddress);

          const milkContract = new ethers.Contract(contractAddress, MilkSupplyChain.abi, signer);
          setContract(milkContract);
          

          await loadUserData(milkContract, userAddress);

          window.ethereum.on('accountsChanged', async (accounts) => {
            setAccount(accounts[0]);
            await loadUserData(milkContract, accounts[0]);
          });
        } else {
          setErrorMessage("Please install MetaMask to use this dApp");
        }
      } catch (err) {
        console.error("Initialization error:", err);
        setErrorMessage("Failed to connect: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    init();
    
    // Clean up event listeners
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
      }
    };
  }, [contractAddress]);

  // Load all user data from the contract
  const loadUserData = async (contractInstance, userAddress) => {
    try {
      // Check user roles
      const adminStatus = await contractInstance.isAdmin(userAddress);
      const producerStatus = await contractInstance.isProducer(userAddress);
      const resellerStatus = await contractInstance.isReseller(userAddress);
      
      setUserRoles({
        isAdmin: adminStatus,
        isProducer: producerStatus,
        isReseller: resellerStatus
      });
      
      // Get stock balance
      const balance = await contractInstance.stockBalance(userAddress);
      setStockBalance(balance.toString());
      
      // Check if user is blacklisted
      const blacklistStatus = await contractInstance.blacklistedHolders(userAddress);
      setIsBlacklisted(blacklistStatus);
      
      // Get batches owned by user
      const batches = await contractInstance.getBatchesByOwner(userAddress);
      setBatchIds(batches.map(b => b.toString()));
      
      // Get batch details
      const details = await Promise.all(
        batches.map(async (id) => {
          const batch = await contractInstance.batches(id);
          return {
            id: id.toString(),
            producer: batch[1],
            quantity: batch[2].toString(),
            timestamp: new Date(batch[3].toNumber() * 1000).toLocaleString(),
            currentOwner: batch[4],
            expired: batch[5]
          };
        })
      );
      setBatchDetails(details);
      
      // Get user violations/alerts
      const violations = await contractInstance.getActiveViolationsByHolder(userAddress);
      setAlerts(violations.map(v => v.toString()));
      
      // If user is reseller, get max quantity
      if (resellerStatus) {
        const max = await contractInstance.maxQuantityPerReseller(userAddress);
        setMaxQuantity(max.toString());
      }
    } catch (err) {
      console.error("Error loading user data:", err);
      setErrorMessage("Failed to load data: " + err.message);
    }
  };

  // Produce milk (for producers)
  const handleProduce = async () => {
    if (!produceQuantity || parseInt(produceQuantity) <= 0) {
      setErrorMessage("Please enter a valid quantity");
      return;
    }
    
    try {
      setTransactionPending(true);
      setErrorMessage('');
      setSuccessMessage('');
      
      const tx = await contract.produce(produceQuantity);
      await tx.wait();
      
      setSuccessMessage(`Successfully produced ${produceQuantity} units of milk`);
      setProduceQuantity('');
      
      // Refresh data
      await loadUserData(contract, account);
    } catch (err) {
      console.error("Production error:", err);
      setErrorMessage("Transaction failed: " + (err.reason || err.message));
    } finally {
      setTransactionPending(false);
    }
  };

  // Transfer stock to another address
  const handleTransfer = async () => {
    if (!transferTo || !ethers.utils.isAddress(transferTo)) {
      setErrorMessage("Please enter a valid recipient address");
      return;
    }
    
    if (!selectedBatchId) {
      setErrorMessage("Please select a batch to transfer");
      return;
    }
    
    if (!transferQuantity || parseInt(transferQuantity) <= 0) {
      setErrorMessage("Please enter a valid quantity");
      return;
    }
    
    try {
      setTransactionPending(true);
      setErrorMessage('');
      setSuccessMessage('');
      
      const tx = await contract.transferStock(transferTo, transferQuantity, selectedBatchId);
      await tx.wait();
      
      setSuccessMessage(`Successfully transferred ${transferQuantity} units to ${transferTo}`);
      setTransferTo('');
      setTransferQuantity('');
      setSelectedBatchId('');
      
      // Refresh data
      await loadUserData(contract, account);
    } catch (err) {
      console.error("Transfer error:", err);
      setErrorMessage("Transaction failed: " + (err.reason || err.message));
    } finally {
      setTransactionPending(false);
    }
  };

  // Helper function to display role
  const getUserRole = () => {
    if (userRoles.isAdmin) return "Admin";
    if (userRoles.isProducer) return "Producer";
    if (userRoles.isReseller) return "Reseller";
    return "No assigned role";
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-gray-50 min-h-screen">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-blue-800 mb-6">Stocks Management</h1>
        
        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        ) : (
          <>
            {errorMessage && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {errorMessage}
              </div>
            )}
            
            {successMessage && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {successMessage}
              </div>
            )}
            
            {/* User Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-sm font-semibold text-blue-800 mb-1">Connected Address</h3>
                <p className="text-gray-700 truncate">{account}</p>
              </div>
              
              {isBlacklisted&&<div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                 <p className="text-red-600 font-bold mt-1">BLACKLISTED</p>
              </div>}
              
              <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-sm font-semibold text-blue-800 mb-1">Total Stock</h3>
                <p className="text-gray-700">{stockBalance} units</p>
                {userRoles.isReseller && (
                  <p className="text-xs text-gray-500 mt-1">Max allowed: {maxQuantity} units</p>
                )}
              </div>
              
            </div>
            
            {/* Action Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Producer Panel */}
              {userRoles.isProducer && (
                <div className="bg-white border rounded-lg p-4 shadow-sm">
                  <h2 className="text-lg font-semibold text-blue-800 mb-4">Produce New Batch</h2>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Quantity</label>
                    <input
                      type="number"
                      value={produceQuantity}
                      onChange={(e) => setProduceQuantity(e.target.value)}
                      className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
                      placeholder="Enter quantity"
                      disabled={transactionPending || isBlacklisted}
                    />
                  </div>
                  <button
                    onClick={handleProduce}
                    disabled={transactionPending || isBlacklisted}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded disabled:opacity-50"
                  >
                    {transactionPending ? "Processing..." : "Produce Milk"}
                  </button>
                  {isBlacklisted && (
                    <p className="text-red-600 text-sm mt-2">
                      You cannot produce while blacklisted
                    </p>
                  )}
                </div>
              )}
              
              {/* Reseller Panel */}
              {(userRoles.isReseller || userRoles.isProducer) && (
                <div className="bg-white border rounded-lg p-4 shadow-sm">
                  <h2 className="text-lg font-semibold text-blue-800 mb-4">Transfer Stock</h2>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Select Batch</label>
                    <select
                      value={selectedBatchId}
                      onChange={(e) => setSelectedBatchId(e.target.value)}
                      className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
                      disabled={transactionPending || isBlacklisted}
                    >
                      <option value="">Select a batch</option>
                      {batchDetails.map((batch) => (
                        <option key={batch.id} value={batch.id}>
                          Batch #{batch.id} - {batch.quantity} units
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Transfer To (Address)</label>
                    <input
                      type="text"
                      value={transferTo}
                      onChange={(e) => setTransferTo(e.target.value)}
                      className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
                      placeholder="0x..."
                      disabled={transactionPending || isBlacklisted}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Quantity</label>
                    <input
                      type="number"
                      value={transferQuantity}
                      onChange={(e) => setTransferQuantity(e.target.value)}
                      className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
                      placeholder="Enter quantity"
                      disabled={transactionPending || isBlacklisted}
                    />
                  </div>
                  <button
                    onClick={handleTransfer}
                    disabled={transactionPending || isBlacklisted}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded disabled:opacity-50"
                  >
                    {transactionPending ? "Processing..." : "Transfer Stock"}
                  </button>
                  {isBlacklisted && (
                    <p className="text-red-600 text-sm mt-2">
                      You cannot transfer while blacklisted
                    </p>
                  )}
                </div>
              )}
            </div>
            
            {/* Batches Table */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-blue-800 mb-4">My Batches</h2>
              {batchDetails.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border rounded-lg overflow-hidden">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="py-3 px-4 text-left">ID</th>
                        <th className="py-3 px-4 text-left">Producer</th>
                        <th className="py-3 px-4 text-left">Quantity</th>
                        <th className="py-3 px-4 text-left">Created</th>
                        <th className="py-3 px-4 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batchDetails.map((batch) => (
                        <tr key={batch.id} className="border-t hover:bg-gray-50">
                          <td className="py-3 px-4">{batch.id}</td>
                          <td className="py-3 px-4 truncate max-w-xs">{batch.producer}</td>
                          <td className="py-3 px-4">{batch.quantity} units</td>
                          <td className="py-3 px-4">{batch.timestamp}</td>
                          <td className="py-3 px-4">
                            {batch.expired ? (
                              <span className="text-red-600">Expired</span>
                            ) : (
                              <span className="text-green-600">Active</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 italic">You don't have any batches yet.</p>
              )}
            </div>
            
            {/* Alerts Section */}
            {alerts.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-blue-800 mb-4">Alerts & Violations</h2>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <p className="text-red-700 font-medium mb-2">
                    You have {alerts.length} active storage violation{alerts.length !== 1 && 's'}
                  </p>
                  <p className="text-gray-700 text-sm">
                    Contact an administrator to resolve these violations. 
                    Accumulating {isBlacklisted ? 'more ' : ''} violations may result in blacklisting.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Stocks;