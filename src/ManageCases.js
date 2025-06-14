import React, { useState } from "react";
import { supabase } from "./supabaseClient";

export default function ManageCases() {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [emails, setEmails] = useState("");
  const [phones, setPhones] = useState("");
  const [imageUrls, setImageUrls] = useState("");
  const [postUrls, setPostUrls] = useState("");
  const [archiveUrls, setArchiveUrls] = useState("");
  const [socialLinks, setSocialLinks] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAddColleague(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error: mainError } = await supabase.from("colleagues").insert([
      {
        username,
        name,
        address,
        pincode,
        additional_info: additionalInfo,
      },
    ]);

    if (mainError) {
      setMessage("❌ Error adding colleague: " + mainError.message);
      setLoading(false);
      return;
    }

    const emailList = emails.split(",").map((e) => e.trim()).filter(Boolean);
    const phoneList = phones.split(",").map((p) => p.trim()).filter(Boolean);
    const imageList = imageUrls.split(",").map((url) => url.trim()).filter(Boolean);
    const postList = postUrls.split(",").map((url) => url.trim()).filter(Boolean);
    const archiveList = archiveUrls.split(",").map((url) => url.trim()).filter(Boolean);

    const socialList = socialLinks.split(",").map((pair) => {
      const [platform, link] = pair.split("::").map((s) => s.trim());
      return platform && link ? { platform, link } : null;
    }).filter(Boolean);

    const insertMany = async (table, items, field) => {
      if (items.length === 0) return;
      await supabase.from(table).insert(items.map((val) => ({ username, [field]: val })));
    };

    try {
      await insertMany("emails", emailList, "email");
      await insertMany("phones", phoneList, "phone");
      await insertMany("images", imageList, "image_url");
      await insertMany("posts", postList, "post_url");
      await insertMany("archives", archiveList, "archive_url");
      if (socialList.length > 0) {
        await supabase.from("social_links").insert(socialList.map((item) => ({
          username,
          platform: item.platform,
          link: item.link,
        })));
      }
      setMessage("✅ Colleague and related data added successfully!");
      // Clear fields
      setUsername("");
      setName("");
      setAddress("");
      setPincode("");
      setEmails("");
      setPhones("");
      setImageUrls("");
      setPostUrls("");
      setArchiveUrls("");
      setSocialLinks("");
      setAdditionalInfo("");
    } catch (e) {
      setMessage("❌ Error while inserting related data.");
    }

    setLoading(false);
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add Colleague</h1>
      <form onSubmit={handleAddColleague} className="space-y-4">
        <div>
          <label>Username (required)</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Full Name</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label>Address</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        <div>
          <label>Pincode</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
          />
        </div>
        <div>
          <label>Emails (comma separated)</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
          />
        </div>
        <div>
          <label>Phone Numbers (comma separated)</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={phones}
            onChange={(e) => setPhones(e.target.value)}
          />
        </div>
        <div>
          <label>Image URLs (comma separated)</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={imageUrls}
            onChange={(e) => setImageUrls(e.target.value)}
          />
        </div>
        <div>
          <label>Post URLs (comma separated)</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={postUrls}
            onChange={(e) => setPostUrls(e.target.value)}
          />
        </div>
        <div>
          <label>Archive URLs (comma separated)</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={archiveUrls}
            onChange={(e) => setArchiveUrls(e.target.value)}
          />
        </div>
        <div>
          <label>Social Links (format: platform::link, comma separated)</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={socialLinks}
            onChange={(e) => setSocialLinks(e.target.value)}
          />
        </div>
        <div>
          <label>Additional Info</label>
          <textarea
            className="w-full p-2 border rounded"
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            rows={3}
          />
        </div>

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
