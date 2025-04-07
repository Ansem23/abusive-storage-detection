import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";

const Dashboard = () => {
  const { contract, account } = useAppContext();
  const [batchCount, setBatchCount] = useState(0);
  const [totalStock, setTotalStock] = useState(0);
  const [activeAlerts, setActiveAlerts] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!contract || !account) return;

      try {
        const batchId = await contract.methods.nextBatchId().call();
        setBatchCount(batchId);

        const stock = await contract.methods.stockBalance(account).call();
        setTotalStock(stock);

        const violations = await contract.methods.getActiveViolationsByHolder(account).call();
        setActiveAlerts(violations.length);
      } catch (error) {
        console.error("Error fetching data from contract:", error);
      }
    };

    fetchData();
  }, [contract, account]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Milk Supply Chain Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-md">
          <h2 className="text-xl font-semibold mb-2">Total Batches</h2>
          <p className="text-2xl font-bold text-blue-600">{batchCount}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-md">
          <h2 className="text-xl font-semibold mb-2">Total Stock</h2>
          <p className="text-2xl font-bold text-green-600">{totalStock}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-md">
          <h2 className="text-xl font-semibold mb-2">Active Alerts</h2>
          <p className="text-2xl font-bold text-red-600">{activeAlerts}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
