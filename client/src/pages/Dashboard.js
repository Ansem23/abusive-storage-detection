import React, { useState } from 'react';
import { FaDownload } from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
  // State variables for forms and data
  const [stockEntries, setStockEntries] = useState([]);
  const [stockExits, setStockExits] = useState([]);
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [location, setLocation] = useState('');
  const [alerts, setAlerts] = useState([]);
  const [threshold, setThreshold] = useState(100); // Example threshold for alerts
  const [timeFilter, setTimeFilter] = useState('week'); // Dropdown filter state

  // Handle stock entry submission
  const handleStockEntry = () => {
    if (!productName || !quantity || !dateTime || !location) {
      alert('Please fill in all fields.');
      return;
    }

    const newEntry = { productName, quantity: parseInt(quantity), dateTime, location };
    setStockEntries([...stockEntries, newEntry]);

    // Check for alerts
    if (parseInt(quantity) > threshold) {
      setAlerts([...alerts, `Stock entry for ${productName} exceeds threshold!`]);
    }

    // Reset form
    setProductName('');
    setQuantity('');
    setDateTime('');
    setLocation('');
  };

  // Handle stock exit submission
  const handleStockExit = () => {
    if (!productName || !quantity || !dateTime || !location) {
      alert('Please fill in all fields.');
      return;
    }

    const newExit = { productName, quantity: parseInt(quantity), dateTime, location };
    setStockExits([...stockExits, newExit]);

    // Reset form
    setProductName('');
    setQuantity('');
    setDateTime('');
    setLocation('');
  };

  // Export declarations as PDF (placeholder function)
  const exportAsPDF = () => {
    alert('Exporting declarations as PDF...');
  };

  // Filter data based on the selected time filter
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

  // Prepare filtered data for the chart
  const filteredStockEntries = filterDataByTime(stockEntries);
  const filteredStockExits = filterDataByTime(stockExits);

  const filteredChartData = {
    labels: filteredStockEntries.map((entry) => new Date(entry.dateTime).toLocaleDateString()), // Dates from filtered stock entries
    datasets: [
      {
        label: 'Stock Entries',
        data: filteredStockEntries.map((entry) => entry.quantity), // Quantities from filtered stock entries
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.4,
      },
      {
        label: 'Stock Exits',
        data: filteredStockExits.map((exit) => exit.quantity), // Quantities from filtered stock exits
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Activity Over Time',
      },
    },
  };

  return (
    <div className="flex min-h-screen bg-blue-900"> {/* Changed bg-gray-50 to bg-blue-900 */}
      <div className="flex-1 flex flex-col items-center justify-center bg-blue-300 p-6"> {/* Changed bg-gray-50 to bg-blue-300 */}
        <div className="max-w-7xl mx-auto">
          {/* Page Title */}
          <h1 className="text-2xl font-bold mb-6 font-inter text-gray-800 text-center">Welcome to your Dashboard!</h1>

          {/* Grid Layout for Boxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Declare Stock Entry */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">📥 Declare Stock Entry</h2>
              <form className="grid grid-cols-1 gap-4">
                <input
                  type="text"
                  placeholder="Product Name"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="p-2 border rounded focus:ring focus:ring-blue-300"
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="p-2 border rounded focus:ring focus:ring-blue-300"
                />
                <input
                  type="datetime-local"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  className="p-2 border rounded focus:ring focus:ring-blue-300"
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="p-2 border rounded focus:ring focus:ring-blue-300"
                />
                <button
                  type="button"
                  onClick={handleStockEntry}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                >
                  Submit Entry
                </button>
              </form>
            </div>

            {/* Declare Stock Exit */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">📤 Declare Stock Exit</h2>
              <form className="grid grid-cols-1 gap-4">
                <input
                  type="text"
                  placeholder="Product Name"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="p-2 border rounded focus:ring focus:ring-blue-300"
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="p-2 border rounded focus:ring focus:ring-blue-300"
                />
                <input
                  type="datetime-local"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  className="p-2 border rounded focus:ring focus:ring-blue-300"
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="p-2 border rounded focus:ring focus:ring-blue-300"
                />
                <button
                  type="button"
                  onClick={handleStockExit}
                  className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
                >
                  Submit Exit
                </button>
              </form>
            </div>

            {/* Activity Chart */}
            <div className="bg-white shadow rounded-lg p-6 col-span-1 md:col-span-2">
              <h2 className="text-xl font-semibold mb-4">📈 Activity Over Time</h2>
              <div className="flex justify-between items-center mb-4">
                <label htmlFor="timeFilter" className="text-gray-700">
                  Filter:
                </label>
                <select
                  id="timeFilter"
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="p-2 border rounded focus:ring focus:ring-blue-300"
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="trimester">This Trimester</option>
                </select>
              </div>
              <div className="h-64 w-full">
                <Line data={filteredChartData} options={chartOptions} />
              </div>
            </div>

            {/* Notifications/Alerts */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">🔔 Notifications/Alerts</h2>
              {alerts.length > 0 ? (
                <ul className="list-disc pl-6">
                  {alerts.map((alert, index) => (
                    <li key={index} className="text-red-600">
                      {alert}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No alerts at the moment.</p>
              )}
            </div>

            {/* My Declarations */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">📁 My Declarations</h2>
              <button
                onClick={exportAsPDF}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center"
              >
                <FaDownload className="mr-2" /> Export as PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;