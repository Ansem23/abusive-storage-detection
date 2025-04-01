// client/src/pages/Stocks.js
import React, { useState } from "react";

const Stocks = () => {
  const [quantity, setQuantity] = useState("");
  const [recipient, setRecipient] = useState("");

  const handleTransfer = () => {
    // Logique de transfert (sera connectée au smart contract plus tard)
    alert(`✅ Transfert de ${quantity}L vers ${recipient}`);
    setQuantity("");
    setRecipient("");
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">📦 Transfert de Stock</h1>

      <div className="bg-white shadow-md rounded-xl p-6 max-w-lg">
        <div className="mb-4">
          <label className="block font-semibold mb-2">Quantité (en litres)</label>
          <input
            type="number"
            className="w-full border rounded-lg px-4 py-2"
            placeholder="ex: 150"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-2">Adresse du destinataire</label>
          <input
            type="text"
            className="w-full border rounded-lg px-4 py-2"
            placeholder="ex: 0x1234..."
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
        </div>

        <button
          onClick={handleTransfer}
          className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          🚚 Transférer
        </button>
      </div>
    </div>
  );
};

export default Stocks;
