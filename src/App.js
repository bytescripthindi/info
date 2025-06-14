import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { supabase } from "./supabaseClient";
import ManageCases from "./ManageCases";
import Tools from "./Tools";

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

function ColleaguesList() {
  const [colleagues, setColleagues] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedUser, setCopiedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    fetchColleagues();
  }, []);

  async function fetchColleagues() {
    setLoading(true);
    const { data, error } = await supabase.from("full_colleague_profile").select("*");
    if (error) {
      console.error("Error fetching colleague data:", error);
    } else {
      setColleagues(data);
    }
    setLoading(false);
  }

  const filteredColleagues = colleagues.filter((c) =>
    c.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    c.username?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 max-w-6xl mx-auto p-6">
      <header className="bg-white shadow p-4 text-center text-3xl font-bold text-gray-800 mb-8 rounded-lg">
        👥 Colleagues Directory
      </header>

      <input
        type="text"
        placeholder="🔍 Search by name or username..."
        className="w-full p-3 mb-8 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {loading ? (
        <p className="text-center text-gray-500">Loading colleagues...</p>
      ) : filteredColleagues.length ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredColleagues.map((c) => (
            <div
              key={c.username}
              className="relative border rounded-2xl bg-white p-5 shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer"
              onClick={() => window.open(`/details/${c.username}`, "_blank")}
            >
              {/* Copy button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(JSON.stringify(c, null, 2));
                  setCopiedUser(c.username);
                  setTimeout(() => setCopiedUser(null), 1500);
                }}
                title="Copy all fields"
                className="absolute top-3 right-3 text-gray-500 hover:text-green-600 transition text-xl"
              >
                {copiedUser === c.username ? "✅" : "📋"}
              </button>

              <h2 className="font-bold text-xl text-purple-900 mb-2">👤 Name: {c.name}</h2>

              <p className="mb-1 text-gray-700">🔑 <strong>Username:</strong> {c.username}</p>
              <p className="mb-1 text-gray-700">📍 <strong>Address:</strong> {c.address}</p>
              <p className="mb-3 text-gray-700">🏷️ <strong>Pincode:</strong> {c.pincode}</p>

              {c.emails?.length > 0 && (
                <p className="mb-1 text-gray-700">📧 <strong>Emails:</strong> {c.emails.join(", ")}</p>
              )}
              {c.phones?.length > 0 && (
                <p className="mb-1 text-gray-700">📞 <strong>Phones:</strong> {c.phones.join(", ")}</p>
              )}
              {c.images?.length > 0 && (
                <p className="mb-1 text-gray-700">🖼️ <strong>Images:</strong> {c.images.join(", ")}</p>
              )}
              {c.posts?.length > 0 && (
                <p className="mb-1 text-gray-700">🔗 <strong>Posts:</strong> {c.posts.join(", ")}</p>
              )}
              {c.archives?.length > 0 && (
                <p className="mb-1 text-gray-700">📁 <strong>Archives:</strong> {c.archives.join(", ")}</p>
              )}

              {c.social_links?.length > 0 && (
                <div className="mt-3">
                  <p className="text-gray-700 font-medium mb-1">📣 <strong>Social Links:</strong></p>
                  <ul className="list-disc ml-5 space-y-1 text-blue-700 underline">
                    {c.social_links.map((s, idx) => (
                      <li key={idx}>
                        {s.platform}: <a href={s.link} target="_blank" rel="noopener noreferrer">{s.link}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No colleagues found.</p>
      )}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <nav className="bg-gray-100 p-4 flex space-x-4 justify-center mb-6 shadow-sm">
        <Link to="/" className="text-blue-600 hover:underline font-medium">🏠 Home</Link>
        <Link to="/manage" className="text-blue-600 hover:underline font-medium">🗃️ Manage</Link>
        <Link to="/tools" className="text-blue-600 hover:underline font-medium">🛠️ Tools</Link>
      </nav>

      <Routes>
        <Route path="/" element={<ColleaguesList />} />
        <Route path="/manage" element={<ManageCases />} />
        <Route path="/tools" element={<Tools />} />
      </Routes>
    </Router>
  );
}
