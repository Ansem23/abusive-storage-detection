import React, { useEffect, useState } from "react";
import Web3 from "web3";
import MilkSupplyChain from "./contracts/MilkSupplyChain.json";
import Topbar from "./components/Topbar";
import Sidebar from "./components/Sidebar";

function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [web3, setWeb3] = useState(null);

  useEffect(() => {
    const init = async () => {
      const web3 = new Web3("http://127.0.0.1:7545");
      setWeb3(web3);

      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);

      const networkId = await web3.eth.net.getId();
      const deployedNetwork = MilkSupplyChain.networks[networkId];

      if (deployedNetwork) {
        const instance = new web3.eth.Contract(
          MilkSupplyChain.abi,
          deployedNetwork.address
        );
        setContract(instance);
      } else {
        alert("Contrat non déployé sur ce réseau.");
      }
    };

    init();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-grow">
        <Topbar />
        <main className="flex-grow p-6">
          <h1 className="text-2xl font-semibold mb-4">Bienvenue !</h1>
          <p className="text-gray-700">
            ✅ Compte connecté : <strong>{account}</strong>
          </p>
        </main>
      </div>
    </div>
  );
}

export default App;
