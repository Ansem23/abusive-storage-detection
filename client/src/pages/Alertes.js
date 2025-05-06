import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import MilkSupplyChain from '../contracts/MilkSupplyChain.json';

const contractAddress = '0xEf8c6E9A29774F5Ff7a521b6A097108D8094933b';

const AlertsPage = () => {
  const [account, setAccount] = useState('');
  const [violations, setViolations] = useState([]);
  const [expiringBatches, setExpiringBatches] = useState([]);

  useEffect(() => {
    connectWallet();
  }, []);

  useEffect(() => {
    if (account) {
      fetchViolations();
      fetchExpiringBatches();
    }
  }, [account]);

  const connectWallet = async () => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      setAccount(accounts[0]);
    } else {
      alert('Please install MetaMask!');
    }
  };

  const fetchViolations = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, MilkSupplyChain.abi, provider);

    try {
      const ids = await contract.violationsByHolder(account);
      const allViolations = await Promise.all(ids.map((id) => contract.violations(id)));
      setViolations(allViolations);
    } catch (err) {
      console.error("Failed to fetch violations:", err);
    }
  };

  const fetchExpiringBatches = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, MilkSupplyChain.abi, provider);

    try {
      const maxDuration = await contract.maxStorageDuration();
      const currentTime = Math.floor(Date.now() / 1000);

      const batchIds = await contract.batchesByOwner(account);
      const batchDetails = await Promise.all(batchIds.map((id) =>
        contract.batches(id).then((data) => ({ ...data, id }))
      ));

      const nearExpiry = batchDetails.filter((batch) =>
        !batch.expired &&
        currentTime > Number(batch.timestamp) + Number(maxDuration) - 2 * 24 * 60 * 60
      );

      setExpiringBatches(nearExpiry);
    } catch (err) {
      console.error("Failed to fetch batches:", err);
    }
  };

  return (
    <div className="p-6 font-sans">
      <h1 className="text-2xl font-bold mb-4">Milk Supply Chain Alerts</h1>
      <p className="mb-4">Connected wallet: <strong>{account}</strong></p>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Your Active Violations</h2>
        {violations.length === 0 ? (
          <p>No violations found.</p>
        ) : (
          <ul className="list-disc list-inside">
            {violations.map((v, i) => (
              <li key={i}>
                Type: {v.violationType}, Batch ID: {v.batchId.toString()}, Time: {new Date(Number(v.detectionTime) * 1000).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Batches Nearing Expiration</h2>
        {expiringBatches.length === 0 ? (
          <p>No batches near expiration.</p>
        ) : (
          <ul className="list-disc list-inside">
            {expiringBatches.map((b, i) => (
              <li key={i}>
                Batch ID: {b.id.toString()}, Quantity: {b.quantity.toString()}, Created: {new Date(Number(b.timestamp) * 1000).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AlertsPage;
