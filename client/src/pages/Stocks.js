// client/src/pages/Stocks.js
import React, { useState } from "react";

const Stocks = () => {
  const [quantity, setQuantity] = useState("");
  const [recipient, setRecipient] = useState("");

  const handleTransfer = () => {
    alert(`✅ Transfert de ${quantity}L vers ${recipient}`);
    setQuantity("");
    setRecipient("");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">📦 Transfert de Stock</h1>

      {/* 
        Agrandissement de la carte : 
        - p-10 pour un padding interne plus grand
        - max-w-4xl au lieu de max-w-2xl (carte plus large)
      */}
      <div className="bg-white shadow-md rounded-xl p-10 max-w-4xl w-full">
        <div className="mb-4">
          <label className="block font-semibold mb-2">Quantity (L)</label>
          <input
            type="number"
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="ex: 150"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label className="block font-semibold mb-2">Destination's address</label>
          <input
            type="text"
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="ex: 0x1234..."
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
        </div>

        <button
          onClick={handleTransfer}
          className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          🚚 Transfer
        </button>
      </div>
    </div>
  );
};

export default Stocks;
