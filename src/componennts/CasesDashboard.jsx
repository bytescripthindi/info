import React, { useState } from "react";

const casesData = [
  { id: 1, title: "Case A vs B", description: "Details about Case A" },
  { id: 2, title: "Case C vs D", description: "Details about Case C" },
  { id: 3, title: "Case E vs F", description: "Details about Case E" },
  // add more sample cases here or fetch from your API later
];

export default function CasesDashboard() {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter cases by search term (case-insensitive)
  const filteredCases = casesData.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto p-4">
      <input
        type="text"
        placeholder="Search cases..."
        className="w-full p-3 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCases.length ? (
          filteredCases.map((c) => (
            <div
              key={c.id}
              className="border rounded-lg p-4 shadow hover:shadow-lg transition cursor-pointer"
            >
              <h2 className="font-semibold text-lg mb-2">{c.title}</h2>
              <p className="text-gray-600 text-sm">{c.description}</p>
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">
            No cases found.
          </p>
        )}
      </div>
    </div>
  );
}
