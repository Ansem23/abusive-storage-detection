import React, { useState, useEffect } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { ethers } from "ethers";
import MilkSupplyChain from "../contracts/MilkSupplyChain.json";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

const CONTRACT_ADDRESS = '0xFAcBc93EC946Ef2F709504F23eA41770a361A07e';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const ResellerDashboard = () => {
  const [userName, setUserName] = useState("");
  const [currentStock, setCurrentStock] = useState(0);
  const [declaredEntries, setDeclaredEntries] = useState(0);
  const [declaredExits, setDeclaredExits] = useState(0);
  const [thresholdAlerts, setThresholdAlerts] = useState(0);
  const [lastSubmissionDate, setLastSubmissionDate] = useState("");
  const [transactionData, setTransactionData] = useState([]);

  const productCategoryData = {
    labels: ["Milk", "Cheese", "Butter", "Yogurt"],
    datasets: [
      {
        data: [40, 30, 20, 10],
        backgroundColor: ["#1957a8", "#fbbb5c", "#bc9c6f", "#7d9dac"],
      },
    ],
  };

  const complianceGaugeData = {
    labels: ["Safe", "Near Limit", "Overstocked"],
    datasets: [
      {
        data: [70, 20, 10],
        backgroundColor: ["#90EE90", "#FFA07A", "#FF6B6B"],
      },
    ],
  };

  const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 10,
          padding: 10,
          font: { size: 11 },
        },
      },
    },
  };

  useEffect(() => {
    const loadData = async () => {
      if (!window.ethereum) return alert("MetaMask not found");

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, MilkSupplyChain.abi, signer);

      const owner = await signer.getAddress();
      const name = await contract.addressName(owner);
      const stockLevel = await contract.stockBalance(owner);
      const violations = await contract.getActiveViolationsByHolder(owner);
      const transactions = await fetchTransferEvents(contract, provider, owner);
      const latestTimestamp = transactions[0]?.[0]?.timestamp ?? "N/A";
      
      setTransactionData(transactions);
      setUserName(name);
      setCurrentStock(Number(stockLevel));
      setThresholdAlerts(violations.length);
      setLastSubmissionDate(latestTimestamp);
      setDeclaredEntries(transactions[0]?.length ?? 0);
      setDeclaredExits(transactions[1]?.length ?? 0);
    };

    loadData();
  }, []);

  // Processing the transaction data to generate new chart data
  const generateTransactionChartData = () => {
    if (!transactionData || transactionData.length === 0 || !transactionData[0]) {
      return {
        labels: [],
        datasets: [
          {
            label: "Entries",
            data: [],
            backgroundColor: "#1957a8",
          },
          {
            label: "Exits",
            data: [],
            backgroundColor: "#fbbb5c",
          },
        ],
      };
    }
  
    const labels = transactionData[0].map(transaction => new Date(transaction.timestamp).toLocaleString('en-US', { weekday: 'long' }));
    const entryData = transactionData[0].map(transaction => parseInt(transaction.quantity));
    const exitData = transactionData[1].map(transaction => parseInt(transaction.quantity));
  
    return {
      labels: labels,
      datasets: [
        {
          label: "Entries",
          data: entryData,
          backgroundColor: "#1957a8",
        },
        {
          label: "Exits",
          data: exitData,
          backgroundColor: "#fbbb5c",
        },
      ],
    };
  };
  

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="bg-[#1957a8] text-white p-4 rounded-lg shadow mb-6">
        <h1 className="text-2xl font-bold">👋 Welcome back, {userName}!</h1>
        <p>Here’s what’s happening with your stock today.</p>
      </div>

      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold">✅ Current Stock Level</h2>
          <p className="text-2xl font-bold">{currentStock} units</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold">🟢 Declared Entries</h2>
          <p className="text-2xl font-bold">{declaredEntries}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold">🔴 Declared Exits</h2>
          <p className="text-2xl font-bold">{declaredExits}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold">⚠️ Violations</h2>
          <p className="text-2xl font-bold">{thresholdAlerts}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold">🔄 Last Submission</h2>
          <p className="text-2xl font-bold">{lastSubmissionDate}</p>
        </div>
      </div>

      <div className="flex flex-col gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow w-full">
          <h2 className="text-lg font-semibold mb-4">📊 Transaction Overview</h2>
          <div className="h-[300px]">
            <Bar data={generateTransactionChartData()} options={chartOptions} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">📦 Product Categories</h2>
            <div className="h-[250px]">
              <Pie data={productCategoryData} options={chartOptions} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">⚖️ Compliance Gauge</h2>
            <div className="h-[250px]">
              <Pie data={complianceGaugeData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <button className="bg-[#1957a8] text-white py-2 px-4 rounded-lg shadow hover:bg-[#164a8e] text-sm">
          ➕ Declare New Stock Movement
        </button>
        <button className="bg-[#978f7c] text-white py-2 px-4 rounded-lg shadow hover:bg-[#887f6c] text-sm">
          📂 View Past Declarations
        </button>
        <button className="bg-[#bc9c6f] text-white py-2 px-4 rounded-lg shadow hover:bg-[#ac8c5f] text-sm">
          📝 Update Profile & Address
        </button>
        <button className="bg-[#fbbb5c] text-white py-2 px-4 rounded-lg shadow hover:bg-[#ebab4c] text-sm">
          🔐 Connect Wallet / MetaMask
        </button>
      </div>
    </div>
  );
};

export default ResellerDashboard;

async function fetchTransferEvents(contractInstance, providerInstance, currentAddress) {
  try {
    const currentBlock = await providerInstance.getBlockNumber();
    const fromBlock = Math.max(0, currentBlock - 10000);

    const transferFilter = contractInstance.filters.Transferred();
    const transferEvents = await contractInstance.queryFilter(transferFilter, fromBlock, "latest");

    const producedFilter = contractInstance.filters.Produced();
    const producedEvents = await contractInstance.queryFilter(producedFilter, fromBlock, "latest");

    const transferDataOut = await Promise.all(
      transferEvents
        .filter(event => event.args.from === currentAddress)
        .map(async event => {
          const block = await event.getBlock();
          return {
            type: "Transfer Out",
            txHash: event.transactionHash,
            from: event.args.from,
            to: event.args.to,
            quantity: event.args.quantity.toString(),
            batchId: event.args.batchId.toString(),
            blockNumber: event.blockNumber,
            timestamp: new Date(block.timestamp * 1000).toLocaleString()
          };
        })
    );

    const transferDataIn = await Promise.all(
      transferEvents
        .filter(event => event.args.to === currentAddress)
        .map(async event => {
          const block = await event.getBlock();
          return {
            type: "Transfer In",
            txHash: event.transactionHash,
            from: event.args.from,
            to: event.args.to,
            quantity: event.args.quantity.toString(),
            batchId: event.args.batchId.toString(),
            blockNumber: event.blockNumber,
            timestamp: new Date(block.timestamp * 1000).toLocaleString()
          };
        })
    );

    const productionData = await Promise.all(
      producedEvents
        .filter(event => event.args.producer === currentAddress)
        .map(async event => {
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
        })
    );

    const allTransactionsIN = [...transferDataIn, ...productionData].sort((a, b) => b.blockNumber - a.blockNumber);
    return [allTransactionsIN, transferDataOut];
  } catch (err) {
    console.error("Error fetching events:", err);
    return [[], []];
  }
}
