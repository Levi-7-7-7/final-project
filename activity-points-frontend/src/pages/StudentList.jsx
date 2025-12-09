import React, { useEffect, useState } from 'react';
import tutorAxios from '../api/tutorAxios';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import '../css/StudentList.css'; // import CSS

const StudentList = () => {
  const [students, setStudents] = useState([]);

  const [batchFilter, setBatchFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [search, setSearch] = useState('');

  const [batchOptions, setBatchOptions] = useState([]);
  const [branchOptions, setBranchOptions] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await tutorAxios.get('/tutors/students');
        const list = res.data.students || [];
        setStudents(list);
        setBatchOptions([...new Set(list.map((s) => s.batch?.name).filter(Boolean))]);
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
    <div className="student-list-card">
      <h2>Student List</h2>

      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search student..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-box"
        />

        <select className="select-box" onChange={(e) => setBatchFilter(e.target.value)}>
          <option value="">All Batches</option>
          {batchOptions.map((b, i) => <option key={i} value={b}>{b}</option>)}
        </select>

        <select className="select-box" onChange={(e) => setBranchFilter(e.target.value)}>
          <option value="">All Branches</option>
          {branchOptions.map((b, i) => <option key={i} value={b}>{b}</option>)}
        </select>

        <button className="btn" onClick={downloadExcel}><Download size={18} /> Excel</button>
        <button className="btn" onClick={downloadPDF}><Download size={18} /> PDF</button>
      </div>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Reg No</th>
              <th>Batch</th>
              <th>Branch</th>
              <th>Email</th>
              <th>Total Points</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr key={i}>
                <td>{s.name}</td>
                <td>{s.registerNumber}</td>
                <td>{s.batch?.name}</td>
                <td>{s.branch?.name}</td>
                <td>{s.email}</td>
                <td className="points">{s.totalPoints || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentList;
