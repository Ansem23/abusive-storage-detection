import React, { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import Web3 from "web3";
import MilkSupplyChain from "../contracts/MilkSupplyChain.json";

const Alertes = () => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [overThreshold, setOverThreshold] = useState([]);
  const [loading, setLoading] = useState(true);

  const THRESHOLD = 1000; // seuil défini pour abus de stockage

  useEffect(() => {
    const initBlockchain = async () => {
      try {
        const web3Instance = new Web3("http://127.0.0.1:7545");
        setWeb3(web3Instance);

        const networkId = await web3Instance.eth.net.getId();
        const deployedNetwork = MilkSupplyChain.networks[networkId];

        if (deployedNetwork) {
          const instance = new web3Instance.eth.Contract(
            MilkSupplyChain.abi,
            deployedNetwork.address
          );
          setContract(instance);

          const accounts = await web3Instance.eth.getAccounts();
          const allProducers = await Promise.all(
            accounts.map(async (addr) => {
              try {
                const isProducer = await instance.methods.isProducer(addr).call();
                const balance = await instance.methods.stockBalance(addr).call();
                return isProducer && balance > THRESHOLD
                  ? { address: addr, balance }
                  : null;
              } catch {
                return null;
              }
            })
          );

          setOverThreshold(allProducers.filter((p) => p !== null));
        } else {
          alert("Contrat non déployé sur ce réseau");
        }
      } catch (err) {
        console.error("Erreur de connexion à la blockchain :", err);
      } finally {
        setLoading(false);
      }
    };

    initBlockchain();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <AlertCircle className="text-red-500" />
        Alertes de stockage abusif
      </h1>

      {loading ? (
        <p>Chargement des données blockchain...</p>
      ) : overThreshold.length === 0 ? (
        <p className="text-green-600">✅ Aucun abus détecté</p>
      ) : (
        <div className="bg-red-100 border border-red-400 p-4 rounded-lg">
          <p className="mb-3 text-red-700 font-semibold">
            Producteurs dépassant le seuil de stockage :
          </p>
          <ul className="list-disc ml-6 text-red-800">
            {overThreshold.map((p, idx) => (
              <li key={idx}>
                Adresse : <strong>{p.address}</strong> — Stock : {p.balance}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Alertes;
