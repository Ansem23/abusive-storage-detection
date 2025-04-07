import React from "react";

const Settings = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">⚙️ Settings</h2>

      <div className="grid gap-4">
        <div className="bg-white p-4 shadow rounded">
          <h3 className="font-bold mb-2">Notification Threshold</h3>
          <input
            type="number"
            placeholder="Set abusive stock limit"
            className="border border-gray-300 p-2 rounded w-full"
          />
        </div>

        <div className="bg-white p-4 shadow rounded">
          <h3 className="font-bold mb-2">Account Management</h3>
          <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
            Remove My Admin Role
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
