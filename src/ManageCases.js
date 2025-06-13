import React, { useState } from "react";
import { supabase } from "./supabaseClient";

export default function ManageCases() {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAddColleague(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.from("colleagues").insert([
      {
        username,
        name,
        address,
        pincode
      },
    ]);

    if (error) {
      setMessage("❌ Error adding colleague: " + error.message);
    } else {
      setMessage("✅ Colleague added successfully!");
      setUsername("");
      setName("");
      setAddress("");
      setPincode("");
    }

    setLoading(false);
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add Colleague</h1>
      <form onSubmit={handleAddColleague} className="space-y-4">
        <input
          type="text"
          placeholder="Username (required)"
          className="w-full p-2 border rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Full Name"
          className="w-full p-2 border rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Address"
          className="w-full p-2 border rounded"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <input
          type="text"
          placeholder="Pincode"
          className="w-full p-2 border rounded"
          value={pincode}
          onChange={(e) => setPincode(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Adding..." : "Add Colleague"}
        </button>
      </form>
      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
}
