// client/src/pages/Transactions.js
import React from "react";

const Transactions = () => {
  // Pour le moment, les données sont fictives. On les remplacera par de vraies transactions plus tard.
  const fakeTransactions = [
    {
      from: "0xProducer1",
      to: "0xFournisseur1",
      quantity: 120,
      date: "2025-04-01 10:00",
    },
    {
      from: "0xFournisseur1",
      to: "0xRevendeur1",
      quantity: 50,
      date: "2025-04-01 12:30",
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">📑 Historique des Transactions</h1>

      <div className="bg-white rounded-xl shadow-md p-4">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 text-left">Expéditeur</th>
              <th className="py-2 px-4 text-left">Destinataire</th>
              <th className="py-2 px-4 text-left">Quantité (L)</th>
              <th className="py-2 px-4 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {fakeTransactions.map((tx, index) => (
              <tr key={index} className="border-t">
                <td className="py-2 px-4">{tx.from}</td>
                <td className="py-2 px-4">{tx.to}</td>
                <td className="py-2 px-4">{tx.quantity}</td>
                <td className="py-2 px-4">{tx.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Transactions;
