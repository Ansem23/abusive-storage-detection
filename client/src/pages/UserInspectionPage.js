import React, { useState } from 'react'; 
import { ethers } from 'ethers';
import MilkSupplyChain from "../contracts/MilkSupplyChain.json";

const contractAddress = '0xEf8c6E9A29774F5Ff7a521b6A097108D8094933b';

const UserInspectionPage = () => {
  const [address, setAddress] = useState('');
  const [name, setName] = useState('');
  const [position, setPosition] = useState(null);
  const [batches, setBatches] = useState([]);
  const [violations, setViolations] = useState([]);
  const [blacklisted, setBlacklisted] = useState(false);
  const [batchId, setBatchId] = useState('');
  const [type, setType] = useState(0); // 0 = ExcessiveStorage, 1 = QuantityOverflow

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(contractAddress, MilkSupplyChain.abi, signer);

  const handleInspect = async () => {
    try {
      const fetchedName = await contract.addressName(address);
      setName(fetchedName);
    } catch (err) {
      console.error("Error fetching name:", err);
    }

    try {
      const pos = await contract.addressPosition(address);
      setPosition({
        latitude: pos.latitude.toString(),
        longitude: pos.longitude.toString(),
      });
    } catch (err) {
      console.error("Error fetching position:", err);
    }

    try {
      const batchIds = await contract.getBatchesByOwner(address);
      const fetchedBatches = await Promise.all(
        batchIds.map(async (id) => {
          const batch = await contract.batches(id);
          return {
            id: batch.id.toString(),
            quantity: batch.quantity.toString(),
            timestamp: new Date(batch.timestamp.toNumber() * 1000).toLocaleString(),
            expired: batch.expired,
          };
        })
      );
      setBatches(fetchedBatches);
    } catch (err) {
      console.error("Error fetching batches:", err);
    }

    try {
      const vIds = await contract.getActiveViolationsByHolder(address);
      const fetchedViolations = await Promise.all(
        vIds.map(async (id) => {
          const v = await contract.violations(id);
          return {
            id: id.toString(),
            type: Object.keys(v.violationType)[0],
            batchId: v.batchId.toString(),
            time: new Date(v.detectionTime.toNumber() * 1000).toLocaleString(),
          };
        })
      );
      setViolations(fetchedViolations);
    } catch (err) {
      console.error("Error fetching violations:", err);
    }

    try {
      const isBlacklisted = await contract.blacklistedHolders(address);
      setBlacklisted(isBlacklisted);
    } catch (err) {
      console.error("Error checking blacklist status:", err);
    }
  };

  const addViolation = async () => {
    try {
      const tx = await contract.triggerFakeViolation(address, parseInt(batchId), type);
      await tx.wait();
      handleInspect();
    } catch (err) {
      console.error("Error adding violation:", err);
    }
  };

  const manuallyBlacklist = async () => {
    try {
      const tx = await contract.blacklistManually(address);
      await tx.wait();
      handleInspect();
    } catch (err) {
      console.error("Error blacklisting manually:", err);
    }
  };

  const removeFromBlacklist = async () => {
    try {
      const tx = await contract.removeFromBlacklist(address);
      await tx.wait();
      handleInspect();
    } catch (err) {
      console.error("Error removing from blacklist:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-900 via-blue-800 to-black p-6">
      <div className="p-6 max-w-3xl mx-auto pt-24">
        <div className="bg-gray-50 p-8 rounded shadow">
          <h1 className="text-2xl font-bold mb-6 text-center">Inspect Producer / Vendor</h1>

          <div className="mb-6">
            <input
              className="border p-2 w-full rounded mb-2"
              placeholder="Enter wallet address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <button
              onClick={handleInspect}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
              Inspect
            </button>
          </div>

          {name && (
            <div className="bg-gray-50 p-4 rounded shadow mb-6">
              <h2 className="text-xl font-semibold mb-2">Holder Information</h2>
              <p><strong>Name:</strong> {name}</p>
              <p><strong>Latitude:</strong> {position?.latitude}</p>
              <p><strong>Longitude:</strong> {position?.longitude}</p>
              <p><strong>Blacklisted:</strong>{' '}
                <span className={blacklisted ? "text-red-600 font-semibold" : "text-green-600 font-semibold"}>
                  {blacklisted ? 'Yes' : 'No'}
                </span>
              </p>

              {blacklisted ? (
                <button
                  onClick={removeFromBlacklist}
                  className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition mt-2"
                >
                  Remove from Blacklist
                </button>
              ) : (
                <button
                  onClick={manuallyBlacklist}
                  className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition mt-2"
                >
                  Manually Blacklist
                </button>
              )}
            </div>
          )}

          {batches.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Batches</h2>
              <ul className="space-y-2">
                {batches.map((batch) => (
                  <li key={batch.id} className="border p-3 rounded bg-white shadow">
                    <strong>Batch #{batch.id}</strong> - Quantity: {batch.quantity} - 
                    Timestamp: {batch.timestamp} - Expired: {batch.expired ? 'Yes' : 'No'}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {violations.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Active Violations</h2>
              <ul className="space-y-2">
                {violations.map((v) => (
                  <li key={v.id} className="border p-3 rounded bg-white shadow">
                    <strong>Violation #{v.id}</strong> - Type: {v.type} - Batch ID: {v.batchId} - Time: {v.time}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Add Violation</h2>
            <input
              className="border p-2 w-full rounded mb-2"
              placeholder="Enter Batch ID"
              type="number"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
            />

            <div className="flex flex-col mb-2">
              <label className="mb-1 font-medium">Violation Type:</label>
              <label className="mb-1">
                <input
                  type="radio"
                  value={0}
                  checked={type === 0}
                  onChange={() => setType(0)}
                  className="mr-2"
                />
                Excessive Storage
              </label>
              <label>
                <input
                  type="radio"
                  value={1}
                  checked={type === 1}
                  onChange={() => setType(1)}
                  className="mr-2"
                />
                Quantity Overflow
              </label>
            </div>

            <button
              onClick={addViolation}
              className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
            >
              Add Violation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInspectionPage;
