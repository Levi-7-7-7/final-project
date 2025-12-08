import React, { useState } from "react";
import tutorAxios from "../api/tutorAxios"; // Use your working tutorAxios
import { FileUp } from "lucide-react";

const UploadCSV = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const upload = async () => {
    if (!file) return alert("Select a file first!");
    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await tutorAxios.post("/tutors/students/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage(res.data.message || "Upload successful!");
      setFile(null);
    } catch (err) {
      console.error("CSV upload error:", err.response ?? err);
      setMessage(err.response?.data?.error || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-4">Upload Students CSV</h2>

      <div className="flex items-center gap-4">
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button className="btn" onClick={upload} disabled={loading}>
          <FileUp size={18} /> {loading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  );
};

export default UploadCSV;
