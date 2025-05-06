import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Link} from "react-router-dom";
import MilkSupplyChain from "../contracts/MilkSupplyChain.json";
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
const contractAddress="0xEf8c6E9A29774F5Ff7a521b6A097108D8094933b";
const AuthorityDashboard = () => {
  // State for dashboard data
  const [activeVendors, setActiveVendors] = useState(150);
  const [activeProducers, setActiveProducers] = useState(20);
  const [batchesNear, setBatchesNear] = useState(23);
  const [abusiveCounter, setAbusiveCounter] = useState(15);

  const [vendors,setVendors] = useState([
    { address: 1, name: "Vendor A", position: [36.8065, 10.1815], status: "active" }, 
    { address: 2, name: "Vendor B", position: [34.7398, 10.7600], status: "warning" },
    { address: 3, name: "Vendor C", position: [35.8245, 10.6346], status: "violation" }, 
    { address: 4, name: "Vendor D", position: [36.4513, 10.7357], status: "active" }, 
    { address: 5, name: "Vendor E", position: [35.6784, 10.0936], status: "warning" }, 
  ]);

  const getMarkerIcon = (status,role) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `<div class="w-8 h-8 rounded-full flex items-center justify-center ${
        status === 'blacklisted' ? 'bg-red-500' :
        status === 'violation' ? 'bg-yellow-500' :
        role === 'reseller'? 'bg-green-500':
        'bg-blue-500'

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
  const [violatorsData, setViolatorsData] = useState({
    labels: [],
    datasets: [{
      label: "Recent batches",
      data: [],
      backgroundColor: "#fbbb5c",
    }]
  });

  // Stock Distribution Data
  const stockDistributionData = {
    labels: ["North", "South", "Central", "East", "West"],
    datasets: [{
      data: [30, 20, 25, 15, 10],
      backgroundColor: ["#1957a8", "#fbbb5c", "#bc9c6f", "#7d9dac", "#978f7c"],
    }]
  };
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
  const [addressName,setAddressName]=useState('');
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
            await RecentBatches(milkContract);
            const vendorInfo=await fetchAllUsersForMap(milkContract);
            console.log(vendorInfo)
            setVendors(vendorInfo);
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
    }, []);
    const loadUserData = async (contractInstance, userAddress) => {
      try {
        

        
        const name = await contractInstance.addressName(userAddress);
        setAddressName(name);
        const totalVendors= await contractInstance.totalResellers();
        setActiveVendors(totalVendors);
        const totalProducers= await contractInstance.totalProducers();
        setActiveProducers(totalProducers);
        const batchesnear = await contractInstance.getBatchesNearingViolation(30);
        setBatchesNear(batchesnear.length);
        const totalViolations = await contractInstance.totalViolations();
        setAbusiveCounter(totalViolations);
        
        
        
      } catch (err) {
        console.error("Error loading user data:", err);
        setErrorMessage("Failed to load data: " + err.message);
      }
    };
    async function RecentBatches(contract) {
      try {
        // Check if contract is properly initialized
        if (!contract || !contract.functions.nextBatchId) {
          console.error("Contract is not properly initialized or missing nextBatchId function");
          return [];
        }
    
        // Try calling nextBatchId with explicit call
        const nextBatchId = await contract.nextBatchId();
        console.log("Next Batch ID:", nextBatchId.toString());
        
        // If nextBatchId is 0, there are no batches yet
        if (nextBatchId.eq(0)) {
          console.log("No batches found in the contract");
          return [];
        }
        
        const batchPromises = [];
        
        // Convert BigNumber to number for the loop
        const batchIdNum = nextBatchId.toNumber();
        
        for (let i = batchIdNum - 1; i >= 0 && i >= batchIdNum - 10; i--) {
          // Only check the 10 most recent batches to avoid excessive calls
          batchPromises.push(contract.batches(i));
        }
        
        const allBatches = await Promise.all(batchPromises);
        
        const validBatches = allBatches
          .map((batch, index) => {
            const startIndex = Math.max(0, batchIdNum - 10);
            return {
              id: startIndex + index,
              producer: batch.producer,
              quantity: batch.quantity.toNumber(),
              timestamp: batch.timestamp.toNumber(),
              currentOwner: batch.currentOwner,
              expired: batch.expired
            };
          })
          .filter(batch => batch.quantity > 0)
          .sort((a, b) => b.timestamp - a.timestamp);
        
        // Get the top 5 recent batches
        const recentBatches = validBatches.slice(0, 5);
        console.log("Valid batches found:", recentBatches.length);
        
        // Create chart data object
        if (recentBatches.length > 0) {
          // Get producer names or addresses
          const labels = recentBatches.map(batch => {
            // Try to get producer name if available, otherwise show shortened address
            return `Batch ${batch.id}`;
          });
          
          // Get quantities for data points
          const data = recentBatches.map(batch => batch.quantity);
          
          // Format data for chart
          const chartData = {
            labels: labels,
            datasets: [{
              label: "Recent batches",
              data: data,
              backgroundColor: "#305CDE",
            }]
          };
          
          // Update state with chart data
          setViolatorsData(chartData);
        }
        
        return recentBatches;
        
      } catch (error) {
        console.error("Error fetching recent batches:", error);
        console.error("Error details:", error.message);
        return [];
      }
    }
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-900 via-blue-800 to-black p-6">
      {/* Welcome Banner */}
      <div className="bg-[#1957a8] text-white p-4 rounded-lg shadow mb-6">
        <h1 className="text-2xl font-bold">👮‍♂️ Authority Control Dashboard </h1>
        <p>Welcome {addressName} to the Monitoring and compliance overview</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold">🏢 Active Vendors</h2>
          <p className="text-2xl font-bold">{activeVendors.toString()}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold">🍶 Active Producers</h2>
          <p className="text-2xl font-bold">{activeProducers.toString()}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold">📅  Suspicious Batches </h2>
          <p className="text-2xl font-bold text-red-500">{batchesNear}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold">🚨 Violations found</h2>
          <p className="text-2xl font-bold text-orange-500">{abusiveCounter.toString()}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Tunisia Map with Vendor Pins */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">🗺️ Vendor Distribution Map</h2>
          <div className="h-[400px] relative">
            <MapContainer 
              center={[36.8065, 10.1815]} 
              zoom={7} 
              className="h-full w-full rounded-lg z-10"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {vendors.map((vendor) => (
                <Marker
                  key={vendor.address}
                  position={vendor.position}
                  icon={getMarkerIcon(vendor.status,vendor.role)}
                >
                  <Popup >
                    <div className="p-2">
                      <h3 className="font-bold">{vendor.name}</h3>
                      <p className="capitalize">Status: {vendor.status}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
            <div className="absolute top-2 right-2 bg-white p-2 rounded-lg shadow z-[10]">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm">Producer</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm">Reseller</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-sm">Warning</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm">blacklisted</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Violators */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">🕛 Recent Batches</h2>
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
            <Link
            to="/Inspection"
            className="bg-[#1957a8] text-white py-3 px-4 rounded-lg shadow hover:bg-[#164a8e]"
          >🧾 Inspect Vendor</Link>
            <button className="bg-[#fbbb5c] text-white py-3 px-4 rounded-lg shadow hover:bg-[#ebab4c]">
              🚩 Flag for Review
            </button>
            <button className="bg-[#bc9c6f] text-white py-3 px-4 rounded-lg shadow hover:bg-[#ac8c5f]" onClick={()=>{
              try{
                contract.checkAllBatchesForAbusiveStorage();
              }
              catch (err) {
                console.error("Error Checking violations:", err);
                setErrorMessage("Failed to contact contract: " + err.message);
            }}}>
              📤 Quick check Violations 
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


async function fetchAllUsersForMap(contract) {
  try {
    // Arrays to store different types of users
    const users = {
      resellers: [],
      producers: [],
      blacklisted: [],
      violationHolders: []
    };
    
    // Get total users to loop through (this is an approximation method)
    // We'll check a range of addresses from past transactions
    const provider = contract.provider;
    const blockNumber = await provider.getBlockNumber();
    const recentBlock = await provider.getBlock(blockNumber);
    
    // Start with unique addresses from the contract's events
    const uniqueAddresses = new Set();
    
    // Get all past events for user addresses
    const addedResellerEvents = await contract.queryFilter(contract.filters.ResellerAdded());
    const addedProducerEvents = await contract.queryFilter(contract.filters.ProducerAdded());
    const blacklistedEvents = await contract.queryFilter(contract.filters.HolderBlacklisted());
    const violationEvents = await contract.queryFilter(contract.filters.AbusiveStorageDetected());
    
    // Add addresses from events
    addedResellerEvents.forEach(event => uniqueAddresses.add(event.args.reseller));
    addedProducerEvents.forEach(event => uniqueAddresses.add(event.args.producer));
    blacklistedEvents.forEach(event => uniqueAddresses.add(event.args.holder));
    violationEvents.forEach(event => uniqueAddresses.add(event.args.holder));
    
    console.log(`Found ${uniqueAddresses.size} unique addresses`);
    
    // Process each address
    const addressPromises = Array.from(uniqueAddresses).map(async (address) => {
      try {
        // Get user role
        const role = await contract.getRole(address);
        
        // Get user position data - if you have this in your contract
        let position = { latitude: 0, longitude: 0 };
        try {
          const pos = await contract.addressPosition(address);
          position = {
            latitude: pos.latitude.toNumber(),
            longitude: pos.longitude.toNumber()
          };
        } catch (err) {
          console.log(`No position data for ${address}`);
        }
        
        // Get user name - if available
        let name = "";
        try {
          name = await contract.addressName(address);
        } catch (err) {
          name = `${role.charAt(0).toUpperCase() + role.slice(1)} ${address.slice(0, 6)}`;
        }
        
        // Check if blacklisted
        const isBlacklisted = await contract.blacklistedHolders(address);
        
        // Check for unresolved violations
        const activeViolations = await contract.getActiveViolationsByHolder(address);
        const hasUnresolvedViolations = activeViolations.length > 0;
        
        // User object with all relevant data
        const user = {
          address,
          name,
          role,
          position: position.latitude && position.longitude ? 
                    [position.latitude / 1000000, position.longitude / 1000000] : 
                    generateRandomTunisiaPosition(), 
          status: isBlacklisted ? "blacklisted" : 
                  hasUnresolvedViolations ? "violation" : 
                  "active"
        };
        
        // Add to appropriate categories
        if (role === "reseller") users.resellers.push(user);
        if (role === "producer") users.producers.push(user);
        if (isBlacklisted) users.blacklisted.push(user);
        if (hasUnresolvedViolations) users.violationHolders.push(user);
        
        return user;
      } catch (err) {
        console.error(`Error processing address ${address}:`, err);
        return null;
      }
    });
    
    const processedUsers = (await Promise.all(addressPromises)).filter(user => user !== null);
    
    console.log("All users:", processedUsers);
    return processedUsers;

  } catch (error) {
    console.error("Error fetching users for map:", error);
    return {
      allUsers: [],
      resellers: [],
      producers: [],
      blacklisted: [],
      violationHolders: []
    };
  }
}

function generateRandomTunisiaPosition() {

  const minLat = 30.2;
  const maxLat = 37.5;
  const minLng = 7.5;
  const maxLng = 11.6;
  
  return [
    minLat + Math.random() * (maxLat - minLat),
    minLng + Math.random() * (maxLng - minLng)
  ];
}