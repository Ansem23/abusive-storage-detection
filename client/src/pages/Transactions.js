import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const MilkTransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [account, setAccount] = useState('');
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);

  // Contract address from your previous input
  const contractAddress = "0x8158765c022d23D0E6eF53863f45218bE7050a82";
  
  // ABI with event definitions - we specifically need the Transferred event
  const contractABI = [
    "event Transferred(address indexed from, address indexed to, uint256 quantity, uint256 batchId)",
    "event Produced(uint256 batchId, address indexed producer, uint256 quantity, uint256 timestamp)",
    "function batches(uint256) view returns (uint256, address, uint256, uint256, address, bool)"
  ];

  useEffect(() => {
    const initWeb3 = async () => {
      try {
        setLoading(true);
        // Check if MetaMask is installed
        if (!window.ethereum) {
          throw new Error("Please install MetaMask to use this dApp");
        }
        
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = ethersProvider.getSigner();
        const userAddress = await signer.getAddress();
        
        setAccount(userAddress);
        setProvider(ethersProvider);
        
        // Create contract instance
        const milkContract = new ethers.Contract(contractAddress, contractABI, ethersProvider);
        setContract(milkContract);
        
        // Load past events
        await fetchTransferEvents(milkContract, ethersProvider);
      } catch (err) {
        console.error("Initialization error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    initWeb3();
  }, [contractAddress]);

  const fetchTransferEvents = async (contractInstance, providerInstance) => {
    try {
      // Get current block number for reference
      const currentBlock = await providerInstance.getBlockNumber();
      
      // Fetch transfer events - we'll look back 10000 blocks or to genesis
      const fromBlock = Math.max(0, currentBlock - 10000);
      
      // Create filter for Transferred events
      const transferFilter = contractInstance.filters.Transferred();
      const transferEvents = await contractInstance.queryFilter(transferFilter, fromBlock, "latest");
      
      // Create filter for Produced events
      const producedFilter = contractInstance.filters.Produced();
      const producedEvents = await contractInstance.queryFilter(producedFilter, fromBlock, "latest");
      
      // Process the transfer events
      const transferData = await Promise.all(transferEvents.map(async (event) => {
        const block = await event.getBlock();
        return {
          type: "Transfer",
          txHash: event.transactionHash,
          from: event.args.from,
          to: event.args.to,
          quantity: event.args.quantity.toString(),
          batchId: event.args.batchId.toString(),
          blockNumber: event.blockNumber,
          timestamp: new Date(block.timestamp * 1000).toLocaleString()
        };
      }));
      
      // Process the production events
      const productionData = await Promise.all(producedEvents.map(async (event) => {
        const block = await event.getBlock();
        return {
          type: "Production",
          txHash: event.transactionHash,
          producer: event.args.producer,
          quantity: event.args.quantity.toString(),
          batchId: event.args.batchId.toString(),
          blockNumber: event.blockNumber,
          timestamp: new Date(block.timestamp * 1000).toLocaleString()
        };
      }));
      
      // Combine both types of events
      const allTransactions = [...transferData, ...productionData].sort((a, b) => 
        b.blockNumber - a.blockNumber
      );
      
      setTransactions(allTransactions);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to load transaction history: " + err.message);
    }
  };

  // Helper function to truncate addresses for display
  const truncateAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Listen for new events in real time
  useEffect(() => {
    if (!contract) return;
    
    const handleTransfer = async (from, to, quantity, batchId, event) => {
      const block = await event.getBlock();
      const newTransaction = {
        type: "Transfer",
        txHash: event.transactionHash,
        from,
        to,
        quantity: quantity.toString(),
        batchId: batchId.toString(),
        blockNumber: event.blockNumber,
        timestamp: new Date(block.timestamp * 1000).toLocaleString()
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
    };
    
    const handleProduction = async (batchId, producer, quantity, timestamp, event) => {
      const block = await event.getBlock();
      const newTransaction = {
        type: "Production",
        txHash: event.transactionHash,
        producer,
        quantity: quantity.toString(),
        batchId: batchId.toString(),
        blockNumber: event.blockNumber,
        timestamp: new Date(block.timestamp * 1000).toLocaleString()
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
    };
    
    // Set up event listeners
    contract.on("Transferred", handleTransfer);
    contract.on("Produced", handleProduction);
    
    // Clean up
    return () => {
      contract.off("Transferred", handleTransfer);
      contract.off("Produced", handleProduction);
    };
  }, [contract]);

  return (
    <div className="p-6 max-w-6xl mx-auto bg-gray-50 min-h-screen">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-blue-800 mb-6">Milk Supply Chain Transaction History</h1>
        
        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-600">Loading transaction history...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        ) : (
          <>
            <div className="bg-blue-50 p-4 rounded-lg shadow-sm mb-6">
              <h3 className="text-sm font-semibold text-blue-800 mb-1">Connected Address</h3>
              <p className="text-gray-700 truncate">{account}</p>
            </div>
            
            <h2 className="text-xl font-semibold text-blue-800 mb-4">All Transactions</h2>
            
            {transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border rounded-lg overflow-hidden">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-3 px-4 text-left">Type</th>
                      <th className="py-3 px-4 text-left">Batch ID</th>
                      <th className="py-3 px-4 text-left">From</th>
                      <th className="py-3 px-4 text-left">To</th>
                      <th className="py-3 px-4 text-left">Quantity</th>
                      <th className="py-3 px-4 text-left">Time</th>
                      <th className="py-3 px-4 text-left">Tx Hash</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx, index) => (
                      <tr key={index} className="border-t hover:bg-gray-50">
                        <td className="py-3 px-4">
                          {tx.type === "Transfer" ? (
                            <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                              Transfer
                            </span>
                          ) : (
                            <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                              Production
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">{tx.batchId}</td>
                        <td className="py-3 px-4">
                          {tx.type === "Production" ? (
                            <span className="text-gray-500">N/A</span>
                          ) : (
                            <span className="font-mono text-xs" title={tx.from}>{truncateAddress(tx.from)}</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {tx.type === "Production" ? (
                            <span className="font-mono text-xs" title={tx.producer}>{truncateAddress(tx.producer)}</span>
                          ) : (
                            <span className="font-mono text-xs" title={tx.to}>{truncateAddress(tx.to)}</span>
                          )}
                        </td>
                        <td className="py-3 px-4">{tx.quantity} units</td>
                        <td className="py-3 px-4">{tx.timestamp}</td>
                        <td className="py-3 px-4">
                          <a 
                            href={`https://etherscan.io/tx/${tx.txHash}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-mono text-xs text-blue-600 hover:underline"
                            title={tx.txHash}
                          >
                            {truncateAddress(tx.txHash)}
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 italic">No transactions found in the recent blocks.</p>
            )}
            
            <p className="text-sm text-gray-500 mt-4">
              Note: Only showing transactions from approximately the last 10,000 blocks.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default MilkTransactionHistory;