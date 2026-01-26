import React, { useState } from "react";
import tutorAxios from "../api/tutorAxios";
import { FileUp } from "lucide-react";
import "../css/UploadCSV.css"; // Import the CSS

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
    <div className="upload-csv-card">
      <h2>Upload Students CSV</h2>

      {/* ===== Instructions Section ===== */}
      <div className="csv-instructions">
        <h4>📄 CSV File Instructions</h4>
        <ul>
          <li>The file must be in <strong>.csv</strong> format</li>
          <li>First row should be the column headers</li>
          <li>Required columns (in this order):</li>
        </ul>

        <pre className="csv-example">
name,registerNumber,email<br/>
Lijo,2301131789,mti@gmail.com
        </pre>

        <p>
          ⚠️ Make sure there are <strong>no extra spaces</strong> and each student
          is on a new line.
        </p>
      </div>

      {/* ===== Upload Section ===== */}
      <div className="upload-section">
        <label className="file-input-label">
          {file ? file.name : "Choose CSV file"}
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </label>

        <button className="upload-btn" onClick={upload} disabled={loading}>
          <FileUp size={18} /> {loading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {message && <p className="upload-message">{message}</p>}
    </div>
  );
};

export default UploadCSV;
