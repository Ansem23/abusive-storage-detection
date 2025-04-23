import React, { useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
} from "chart.js";
import tunisiaRegions from '../data/tunisiaRegions.json'; // You'll need to create this file

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

// Fix for default marker icons in leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const AuthorityDashboard = () => {
  // State for dashboard data
  const [activeVendors, setActiveVendors] = useState(150);
  const [stockDeclarations, setStockDeclarations] = useState(1240);
  const [thresholdBreaches, setThresholdBreaches] = useState(23);
  const [missedDeclarations, setMissedDeclarations] = useState(15);

  // Sample vendor locations in Tunisia
  const vendors = [
    { id: 1, name: "Vendor A", position: [36.8065, 10.1815], status: "active" }, // Tunis
    { id: 2, name: "Vendor B", position: [34.7398, 10.7600], status: "warning" }, // Sfax
    { id: 3, name: "Vendor C", position: [35.8245, 10.6346], status: "violation" }, // Sousse
    { id: 4, name: "Vendor D", position: [36.4513, 10.7357], status: "active" }, // Nabeul
    { id: 5, name: "Vendor E", position: [35.6784, 10.0936], status: "warning" }, // Kairouan
  ];

  // Custom markers for different vendor statuses
  const getMarkerIcon = (status) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `<div class="w-8 h-8 rounded-full flex items-center justify-center ${
        status === 'active' ? 'bg-blue-500' :
        status === 'warning' ? 'bg-yellow-500' :
        'bg-red-500'
      } text-white text-xl">•</div>`
    });
  };

  // Chart Options
  const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 10,
          padding: 10,
          font: { size: 11 }
        }
      }
    }
  };

  // Replace breachData with map data
  const mapData = {
    labels: ["Tunis", "Sfax", "Sousse", "Kairouan", "Bizerte"],
    datasets: [{
      label: "Registered Vendors",
      data: [25, 18, 15, 12, 10],
      backgroundColor: Array(5).fill("#1957a8"),
      borderColor: Array(5).fill("#fff"),
      borderWidth: 1,
    }]
  };

  // Map specific options
  const mapOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      title: {
        display: true,
        text: 'Vendor Distribution by Region'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Vendors'
        }
      }
    }
  };

  // Top Violators Data
  const violatorsData = {
    labels: ["Vendor A", "Vendor B", "Vendor C", "Vendor D", "Vendor E"],
    datasets: [{
      label: "Number of Violations",
      data: [8, 6, 5, 4, 3],
      backgroundColor: "#fbbb5c",
    }]
  };

  // Stock Distribution Data
  const stockDistributionData = {
    labels: ["North", "South", "Central", "East", "West"],
    datasets: [{
      data: [30, 20, 25, 15, 10],
      backgroundColor: ["#1957a8", "#fbbb5c", "#bc9c6f", "#7d9dac", "#978f7c"],
    }]
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-900 via-blue-800 to-black p-6">
      {/* Welcome Banner */}
      <div className="bg-[#1957a8] text-white p-4 rounded-lg shadow mb-6">
        <h1 className="text-2xl font-bold">👮‍♂️ Authority Control Dashboard</h1>
        <p>Monitoring and compliance overview</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold">🏢 Active Vendors</h2>
          <p className="text-2xl font-bold">{activeVendors}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold">📊 Stock Declarations</h2>
          <p className="text-2xl font-bold">{stockDeclarations}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold">🚨 Threshold Breaches</h2>
          <p className="text-2xl font-bold text-red-500">{thresholdBreaches}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold">📅 Missed Declarations</h2>
          <p className="text-2xl font-bold text-orange-500">{missedDeclarations}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Tunisia Map with Vendor Pins */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">🗺️ Vendor Distribution Map</h2>
          <div className="h-[400px] relative">
            <MapContainer 
              center={[36.8065, 10.1815]} // Centered on Tunis
              zoom={7} 
              className="h-full w-full rounded-lg"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {vendors.map((vendor) => (
                <Marker
                  key={vendor.id}
                  position={vendor.position}
                  icon={getMarkerIcon(vendor.status)}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-bold">{vendor.name}</h3>
                      <p className="capitalize">Status: {vendor.status}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
            <div className="absolute top-2 right-2 bg-white p-2 rounded-lg shadow z-[1000]">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm">Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-sm">Warning</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm">Violation</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Violators */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">⚠️ Top Violators</h2>
          <div className="h-[300px]">
            <Bar data={violatorsData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Stock Distribution */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">🗺️ Regional Distribution</h2>
          <div className="h-[250px]">
            <Pie data={stockDistributionData} options={chartOptions} />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-span-2 bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">🔧 Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="bg-[#1957a8] text-white py-3 px-4 rounded-lg shadow hover:bg-[#164a8e]">
              🧾 Inspect Vendor
            </button>
            <button className="bg-[#fbbb5c] text-white py-3 px-4 rounded-lg shadow hover:bg-[#ebab4c]">
              🚩 Flag for Review
            </button>
            <button className="bg-[#bc9c6f] text-white py-3 px-4 rounded-lg shadow hover:bg-[#ac8c5f]">
              📤 Export Reports
            </button>
            <button className="bg-[#978f7c] text-white py-3 px-4 rounded-lg shadow hover:bg-[#887f6c]">
              📬 Send Warning
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorityDashboard;