import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";

// Composants simples pour afficher les lots
const Card = ({ children }) => (
  <div className="bg-white shadow rounded-xl p-4 border m-2">{children}</div>
);
const CardContent = ({ children }) => <div>{children}</div>;

const Batches = () => {
  const { contract, account } = useAppContext();
  const [batches, setBatches] = useState([]);

  useEffect(() => {
    const fetchBatches = async () => {
      if (!contract || !account) return;

      try {
        const batchIds = await contract.methods.getBatchesByOwner(account).call();
        const batchDetails = await Promise.all(
          batchIds.map((id) => contract.methods.batches(id).call())
        );

        setBatches(batchDetails);
      } catch (err) {
        console.error("Erreur lors de la récupération des lots :", err);
      }
    };

    fetchBatches();
  }, [contract, account]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Mes Lots</h2>

      {batches.length === 0 ? (
        <p className="text-gray-500">Aucun lot trouvé.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {batches.map((batch) => (
            <Card key={batch.id}>
              <CardContent>
                <h3 className="text-lg font-semibold">Lot #{batch.id}</h3>
                <p>Quantité : {batch.quantity}</p>
                <p>Producteur : {batch.producer}</p>
                <p>Propriétaire : {batch.currentOwner}</p>
                <p>
                  Créé le :{" "}
                  {new Date(batch.timestamp * 1000).toLocaleDateString()}
                </p>
                <p>Expiré : {batch.expired ? "✅ Oui" : "❌ Non"}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Batches;
