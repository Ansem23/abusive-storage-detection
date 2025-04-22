import React, { useState, useEffect } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { ethers } from "ethers";
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

// Register required components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const ProducerDashboard = () => {
  const [userName, setUserName] = useState("Producer X"); // Replace with dynamic user data
  const [currentStock, setCurrentStock] = useState(1200); // Example stock level
  const [declaredEntries, setDeclaredEntries] = useState(300); // Example entries
  const [declaredExits, setDeclaredExits] = useState(200); // Example exits
  const [thresholdAlerts, setThresholdAlerts] = useState(2); // Example alerts
  const [lastSubmissionDate, setLastSubmissionDate] = useState("2025-04-15"); // Example date

  // Example data for charts
  const stockMovementData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Entries",
        data: [50, 60, 70, 80, 90, 100, 110],
        backgroundColor: "#1957a8", // fun-blue
      },
      {
        label: "Exits",
        data: [30, 40, 50, 60, 70, 80, 90],
        backgroundColor: "#fbbb5c", // saffron-mango
      },
    ],
  };

  const productCategoryData = {
    labels: ["Milk", "Cheese", "Butter", "Yogurt"],
    datasets: [
      {
        data: [40, 30, 20, 10],
        backgroundColor: ["#1957a8", "#fbbb5c", "#bc9c6f", "#7d9dac"], // fun-blue, saffron-mango, teak, bali-hai
      },
    ],
  };

  const complianceGaugeData = {
    labels: ["Safe", "Near Limit", "Overstocked"],
    datasets: [
      {
        data: [70, 20, 10],
        backgroundColor: [
          "#90EE90", // light green (sage green) for Safe
          "#FFA07A", // light salmon (orange) for Near Limit
          "#FF6B6B", // light red for Overstocked
        ],
      },
    ],
  };

  // Add chart options
  const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 10,
          padding: 10,
          font: {
            size: 11
          }
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6"> {/* Removed ml-64 */}
      {/* Welcome Banner */}
      <div className="bg-[#1957a8] text-white p-4 rounded-lg shadow mb-6">
        <h1 className="text-2xl font-bold">👋 Welcome back, {userName}!</h1>
        <p>Here’s what’s happening with your stock today.</p>
      </div>

      {/* Top Stats */}
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
          <h2 className="text-lg font-semibold">⚠️ Threshold Alerts</h2>
          <p className="text-2xl font-bold">{thresholdAlerts}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold">🔄 Last Submission</h2>
          <p className="text-2xl font-bold">{lastSubmissionDate}</p>
        </div>
      </div>

      {/* Middle Section */}
      <div className="flex flex-col gap-6 mb-6">
        {/* Stock Movement Chart - Full Width */}
        <div className="bg-white p-4 rounded-lg shadow w-full">
          <h2 className="text-lg font-semibold mb-4">📊 Stock Movement</h2>
          <div className="h-[300px]">
            <Bar data={stockMovementData} options={chartOptions} />
          </div>
        </div>

        {/* Pie Charts Row */}
        <div className="grid grid-cols-2 gap-6">
          {/* Product Category Pie Chart */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">📦 Product Categories</h2>
            <div className="h-[250px]">
              <Pie data={productCategoryData} options={chartOptions} />
            </div>
          </div>

          {/* Compliance Gauge */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">⚖️ Compliance Gauge</h2>
            <div className="h-[250px]">
              <Pie data={complianceGaugeData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Actions Section */}
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

export default ProducerDashboard;