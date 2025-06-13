import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ManageCases from "./ManageCases"; // Optional if you're managing records
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
  const [loading, setLoading] = useState(true);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    fetchColleagues();
  }, []);

  async function fetchColleagues() {
    setLoading(true);
    const { data, error } = await supabase
      .from("full_colleague_profile")
      .select("*");

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
    <div className="min-h-screen bg-gray-50 max-w-5xl mx-auto p-4">
      <header className="bg-white shadow p-4 text-center text-2xl font-bold mb-6">
        Colleagues
      </header>

      <input
        type="text"
        placeholder="Search by name or username..."
        className="w-full p-3 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="border rounded-lg p-4 shadow hover:shadow-lg transition cursor-pointer bg-white"
            >
              <h2 className="font-semibold text-lg mb-1">{c.name}</h2>
              <p className="text-sm text-gray-600">Username: {c.username}</p>
              <p className="text-sm text-gray-600">Address: {c.address}</p>
              <p className="text-sm text-gray-600">Pincode: {c.pincode}</p>

              {c.emails?.length > 0 && (
                <p className="text-sm mt-2"><strong>Emails:</strong> {c.emails.join(", ")}</p>
              )}
              {c.phones?.length > 0 && (
                <p className="text-sm"><strong>Phones:</strong> {c.phones.join(", ")}</p>
              )}
              {c.posts?.length > 0 && (
                <p className="text-sm"><strong>Posts:</strong> {c.posts.join(", ")}</p>
              )}
              {c.archives?.length > 0 && (
                <p className="text-sm"><strong>Archives:</strong> {c.archives.join(", ")}</p>
              )}
              {c.images?.length > 0 && (
                <p className="text-sm"><strong>Images:</strong> {c.images.join(", ")}</p>
              )}

              {c.social_links?.length > 0 && (
                <div className="text-sm mt-2">
                  <strong>Social Links:</strong>
                  <ul className="list-disc ml-5">
                    {c.social_links.map((s, idx) => (
                      <li key={idx}>
                        {s.platform}: <a href={s.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{s.link}</a>
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
      <nav className="bg-gray-100 p-4 flex space-x-4 justify-center mb-6">
        <Link to="/" className="text-blue-600 hover:underline">
          Home
        </Link>
        <Link to="/manage" className="text-blue-600 hover:underline">
          Manage
        </Link>
        <Link to="/tools" className="text-blue-600 hover:underline">
          Tools
        </Link>
      </nav>

      <Routes>
        <Route path="/" element={<ColleaguesList />} />
        <Route path="/manage" element={<ManageCases />} /> {/* Optional */}
        <Route path="/tools" element={<Tools />} /> {/* Optional */}
      </Routes>
    </Router>
  );
}
