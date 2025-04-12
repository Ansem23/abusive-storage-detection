import React, { useState, useEffect, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Enregistrement des composants Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
  // États pour les données de stock
  const [stockEntries, setStockEntries] = useState([]);
  const [stockExits, setStockExits] = useState([]);
  // États séparés pour chaque formulaire
  const [entryData, setEntryData] = useState({
    productName: '',
    quantity: '',
    dateTime: '',
    location: '',
  });
  const [exitData, setExitData] = useState({
    productName: '',
    quantity: '',
    dateTime: '',
    location: '',
  });
  // Alertes et configuration
  const [alerts, setAlerts] = useState([]);
  const [threshold] = useState(100); // Seuil d'alerte
  const [timeFilter, setTimeFilter] = useState('week'); // Filtre déroulant

  // Auto disparition des alertes après 5 secondes
  useEffect(() => {
    if (alerts.length > 0) {
      const timer = setTimeout(() => setAlerts([]), 5000);
      return () => clearTimeout(timer);
    }
  }, [alerts]);

  // Gestion de la soumission du formulaire d'entrée de stock
  const handleStockEntry = () => {
    const { productName, quantity, dateTime, location } = entryData;
    if (!productName || !quantity || !dateTime || !location) {
      alert('Please fill in all fields.');
      return;
    }
    const newEntry = { productName, quantity: parseInt(quantity), dateTime, location };
    setStockEntries([...stockEntries, newEntry]);
    if (parseInt(quantity) > threshold) {
      setAlerts([...alerts, `Stock entry for ${productName} exceeds threshold!`]);
    }
    setEntryData({ productName: '', quantity: '', dateTime: '', location: '' });
  };

  // Gestion de la soumission du formulaire de sortie de stock
  const handleStockExit = () => {
    const { productName, quantity, dateTime, location } = exitData;
    if (!productName || !quantity || !dateTime || !location) {
      alert('Please fill in all fields.');
      return;
    }
    const newExit = { productName, quantity: parseInt(quantity), dateTime, location };
    setStockExits([...stockExits, newExit]);
    setExitData({ productName: '', quantity: '', dateTime: '', location: '' });
  };

  // Fonction de filtrage des données selon la période sélectionnée
  const filterDataByTime = (data) => {
    const now = new Date();
    return data.filter((item) => {
      const itemDate = new Date(item.dateTime);
      if (timeFilter === 'week') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        return itemDate >= oneWeekAgo && itemDate <= now;
      } else if (timeFilter === 'month') {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(now.getMonth() - 1);
        return itemDate >= oneMonthAgo && itemDate <= now;
      } else if (timeFilter === 'trimester') {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(now.getMonth() - 3);
        return itemDate >= threeMonthsAgo && itemDate <= now;
      }
      return true;
    });
  };

  // Optimisation du filtrage avec useMemo
  const filteredStockEntries = useMemo(() => filterDataByTime(stockEntries), [stockEntries, timeFilter]);
  const filteredStockExits = useMemo(() => filterDataByTime(stockExits), [stockExits, timeFilter]);

  const filteredChartData = {
    labels: filteredStockEntries.map((entry) => new Date(entry.dateTime).toLocaleDateString()),
    datasets: [
      {
        label: 'Stock Entries',
        data: filteredStockEntries.map((entry) => entry.quantity),
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.4,
      },
      {
        label: 'Stock Exits',
        data: filteredStockExits.map((exit) => exit.quantity),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Activity Over Time' },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-800 to-purple-700 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Titre de la page */}
        <h1 className="text-3xl font-bold text-center text-white mb-6">Welcome to your Dashboard!</h1>

        {/* Alertes */}
        {alerts.length > 0 && (
          <div className="mb-4 p-4 bg-yellow-100 text-yellow-800 rounded shadow transition-all duration-300">
            {alerts.map((alertMsg, index) => (
              <p key={index}>{alertMsg}</p>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Formulaire d'entrée */}
          <div className="bg-white rounded-lg shadow-md p-8 transform hover:scale-105 transition duration-300">
            <h2 className="text-2xl font-semibold mb-4">📥 Declare Stock Entry</h2>
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Product Name"
                value={entryData.productName}
                onChange={(e) => setEntryData({ ...entryData, productName: e.target.value })}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
              />
              <input
                type="number"
                placeholder="Quantity"
                value={entryData.quantity}
                onChange={(e) => setEntryData({ ...entryData, quantity: e.target.value })}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                min="1"
              />
              <input
                type="datetime-local"
                value={entryData.dateTime}
                onChange={(e) => setEntryData({ ...entryData, dateTime: e.target.value })}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
              />
              <input
                type="text"
                placeholder="Location"
                value={entryData.location}
                onChange={(e) => setEntryData({ ...entryData, location: e.target.value })}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
              />
              <button
                type="button"
                onClick={handleStockEntry}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors duration-300"
              >
                Submit Entry
              </button>
            </form>
          </div>

          {/* Formulaire de sortie */}
          <div className="bg-white rounded-lg shadow-md p-8 transform hover:scale-105 transition duration-300">
            <h2 className="text-2xl font-semibold mb-4">📤 Declare Stock Exit</h2>
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Product Name"
                value={exitData.productName}
                onChange={(e) => setExitData({ ...exitData, productName: e.target.value })}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-green-300 transition"
              />
              <input
                type="number"
                placeholder="Quantity"
                value={exitData.quantity}
                onChange={(e) => setExitData({ ...exitData, quantity: e.target.value })}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-green-300 transition"
                min="1"
              />
              <input
                type="datetime-local"
                value={exitData.dateTime}
                onChange={(e) => setExitData({ ...exitData, dateTime: e.target.value })}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-green-300 transition"
              />
              <input
                type="text"
                placeholder="Location"
                value={exitData.location}
                onChange={(e) => setExitData({ ...exitData, location: e.target.value })}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-green-300 transition"
              />
              <button
                type="button"
                onClick={handleStockExit}
                className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded transition-colors duration-300"
              >
                Submit Exit
              </button>
            </form>
          </div>

          {/* Graphique d'activité */}
          <div className="bg-white rounded-lg shadow-md p-8 col-span-1 md:col-span-2 transform hover:scale-105 transition duration-300">
            <h2 className="text-2xl font-semibold mb-4">📈 Activity Over Time</h2>
            <div className="flex justify-between items-center mb-4">
              <label htmlFor="timeFilter" className="text-gray-700">
                Filter:
              </label>
              <select
                id="timeFilter"
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="p-3 border rounded focus:outline-none focus:ring-2 focus:ring-purple-300 transition"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="trimester">This Trimester</option>
              </select>
            </div>
            <div className="h-96 w-full">
              <Line data={filteredChartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
