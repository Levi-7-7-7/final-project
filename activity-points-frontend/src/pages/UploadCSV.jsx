import React, { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { FileUp } from "lucide-react";

const UploadCSV = () => {
  const [file, setFile] = useState(null);

  const upload = async () => {
    if (!file) return alert("Select a file first!");

    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("tutorToken");

    try {
      const res = await axios.post(
        `${BASE_URL}/api/tutors/students/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Upload Successful!");
    } catch (err) {
      alert("Upload failed");
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

        <button className="btn" onClick={upload}>
          <FileUp size={18} /> Upload
        </button>
      </div>
    </div>
  );
};

export default UploadCSV;
