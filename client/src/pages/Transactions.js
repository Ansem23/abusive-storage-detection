import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const MilkTransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [account, setAccount] = useState('');
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);

  // Filters and pagination
  const [filterType, setFilterType] = useState('');
  const [filterBatchId, setFilterBatchId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Contract details
  const contractAddress = "0xEf8c6E9A29774F5Ff7a521b6A097108D8094933b";
  const contractABI = [
    "event Transferred(address indexed from, address indexed to, uint256 quantity, uint256 batchId)",
    "event Produced(uint256 batchId, address indexed producer, uint256 quantity, uint256 timestamp)",
    "function batches(uint256) view returns (uint256, address, uint256, uint256, address, bool)"
  ];

  useEffect(() => {
    const initWeb3 = async () => {
      try {
        setLoading(true);
        if (!window.ethereum) {
          throw new Error("Please install MetaMask to use this dApp");
        }

        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = ethersProvider.getSigner();
        const userAddress = await signer.getAddress();

        setAccount(userAddress);
        setProvider(ethersProvider);

        const milkContract = new ethers.Contract(contractAddress, contractABI, ethersProvider);
        setContract(milkContract);

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
      const currentBlock = await providerInstance.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 10000);

      const transferFilter = contractInstance.filters.Transferred();
      const transferEvents = await contractInstance.queryFilter(transferFilter, fromBlock, "latest");

      const producedFilter = contractInstance.filters.Produced();
      const producedEvents = await contractInstance.queryFilter(producedFilter, fromBlock, "latest");

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

      const allTransactions = [...transferData, ...productionData].sort((a, b) => b.blockNumber - a.blockNumber);
      setTransactions(allTransactions);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to load transaction history: " + err.message);
    }
  };

  const truncateAddress = (address) => `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;

  const filteredTransactions = transactions.filter((tx) => {
    return (
      (filterType ? tx.type === filterType : true) &&
      (filterBatchId ? tx.batchId.includes(filterBatchId) : true)
    );
  });

  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  const exportToCSV = () => {
    const csvContent = [
      ["Type", "Batch ID", "From", "To", "Quantity", "Time", "Tx Hash"],
      ...transactions.map((tx) => [
        tx.type,
        tx.batchId,
        tx.from || "N/A",
        tx.to || "N/A",
        tx.quantity,
        tx.timestamp,
        tx.txHash,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "transactions.csv";
    link.click();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-gray-50 min-h-screen">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-blue-800 mb-6">Transaction History</h1>

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

            <div className="flex gap-4 mb-6">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="p-2 border rounded"
              >
                <option value="">All Types</option>
                <option value="Transfer">Transfer</option>
                <option value="Production">Production</option>
              </select>
              <input
                type="text"
                placeholder="Filter by Batch ID"
                value={filterBatchId}
                onChange={(e) => setFilterBatchId(e.target.value)}
                className="p-2 border rounded"
              />
              <button
                onClick={exportToCSV}
                className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-900"
              >
                Export to CSV
              </button>
            </div>

            {paginatedTransactions.length > 0 ? (
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
                    {paginatedTransactions.map((tx, index) => (
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
                        <td className="py-3 px-4">{tx.from ? truncateAddress(tx.from) : "N/A"}</td>
                        <td className="py-3 px-4">{tx.to ? truncateAddress(tx.to) : "N/A"}</td>
                        <td className="py-3 px-4">{tx.quantity} units</td>
                        <td className="py-3 px-4">{tx.timestamp}</td>
                        <td className="py-3 px-4">
                          <a
                            href={`https://etherscan.io/tx/${tx.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-xs text-blue-600 hover:underline"
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

            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MilkTransactionHistory;