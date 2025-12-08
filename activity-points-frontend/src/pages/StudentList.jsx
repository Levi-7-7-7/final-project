import React, { useEffect, useState } from 'react';
import tutorAxios from '../api/tutorAxios';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const StudentList = () => {
  const [students, setStudents] = useState([]);

  const [batchFilter, setBatchFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [search, setSearch] = useState('');

  // dynamic dropdown options
  const [batchOptions, setBatchOptions] = useState([]);
  const [branchOptions, setBranchOptions] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await tutorAxios.get('/tutors/students');

        // backend returns { success: true, students: [...] }
        const list = res.data.students;

        setStudents(list);

        // generate unique batch names
        setBatchOptions([...new Set(list.map((s) => s.batch?.name).filter(Boolean))]);

        // generate unique branch names
        setBranchOptions([...new Set(list.map((s) => s.branch?.name).filter(Boolean))]);

      } catch (err) {
        console.error(err);
      }
    };

    fetchStudents();
  }, []);

  const filtered = students.filter((s) => {
    return (
      (batchFilter ? s.batch?.name === batchFilter : true) &&
      (branchFilter ? s.branch?.name === branchFilter : true) &&
      (search ? s.name.toLowerCase().includes(search.toLowerCase()) : true)
    );
  });

  const downloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filtered.map((s) => ({
        Name: s.name,
        RegisterNumber: s.registerNumber,
        Batch: s.batch?.name,
        Branch: s.branch?.name,
        Email: s.email,
        TotalPoints: s.totalPoints || 0,
      }))
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    XLSX.writeFile(wb, 'students_list.xlsx');
  };

  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.text('Student List', 14, 16);

    autoTable(doc, {
      startY: 22,
      head: [['Name', 'Reg No', 'Batch', 'Branch', 'Email', 'Total Points']],
      body: filtered.map((s) => [
        s.name,
        s.registerNumber,
        s.batch?.name || '',
        s.branch?.name || '',
        s.email,
        s.totalPoints || 0,
      ]),
    });

    doc.save('students_list.pdf');
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-4">Student List</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4">

        <input
          type="text"
          placeholder="Search student..."
          className="input-box"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select className="select-box" onChange={(e) => setBatchFilter(e.target.value)}>
          <option value="">All Batches</option>
          {batchOptions.map((b, i) => (
            <option key={i} value={b}>{b}</option>
          ))}
        </select>

        <select className="select-box" onChange={(e) => setBranchFilter(e.target.value)}>
          <option value="">All Branches</option>
          {branchOptions.map((b, i) => (
            <option key={i} value={b}>{b}</option>
          ))}
        </select>

        <button className="btn" onClick={downloadExcel}>
          <Download size={18} /> Excel
        </button>

        <button className="btn" onClick={downloadPDF}>
          <Download size={18} /> PDF
        </button>
      </div>

      {/* Table */}
      <table className="w-full table-auto border">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-2">Name</th>
            <th className="p-2">Reg No</th>
            <th className="p-2">Batch</th>
            <th className="p-2">Branch</th>
            <th className="p-2">Email</th>
            <th className="p-2">Total Points</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((s, i) => (
            <tr key={i} className="border">
              <td className="p-2">{s.name}</td>
              <td className="p-2">{s.registerNumber}</td>
              <td className="p-2">{s.batch?.name}</td>
              <td className="p-2">{s.branch?.name}</td>
              <td className="p-2">{s.email}</td>
              <td className="p-2 font-semibold">{s.totalPoints || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentList;
