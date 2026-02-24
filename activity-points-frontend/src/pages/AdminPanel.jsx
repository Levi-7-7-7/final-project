// src/pages/AdminPanel.jsx
import React, { useEffect, useState, useRef } from "react";
import adminAxios from "../api/adminAxios"; // create this like your tutorAxios but for admin
import { UserPlus, Users, FilePlus, Download, Edit, Trash2, Plus } from "lucide-react";
import '../css/AdminPanel.css'; // create/adjust styles as needed

export default function AdminPanel() {
  const [tab, setTab] = useState("tutors"); // tutors | batches | branches | categories
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // tutors
  const [tutors, setTutors] = useState([]);
  const [tutorForm, setTutorForm] = useState({ name: "", email: "", password: "" });
  const tutorCsvRef = useRef(null);

  // batches & branches
  const [batches, setBatches] = useState([]);
  const [branches, setBranches] = useState([]);
  const [batchName, setBatchName] = useState("");
  const [branchName, setBranchName] = useState("");

  // categories
  const [categories, setCategories] = useState([]);
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "", maxPoints: "", minDuration: "" });
  const [newSub, setNewSub] = useState({ name: "", points: "", level: "" });

  // editing
  const [editingCategory, setEditingCategory] = useState(null);

  // fetch initial data
  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [tutRes, batchRes, branchRes, catRes] = await Promise.all([
        adminAxios.get("/admin/tutors"),
        adminAxios.get("/admin/batches"),
        adminAxios.get("/admin/branches"),
        adminAxios.get("/admin/categories"),
      ]);
      setTutors(tutRes.data.tutors || []);
      setBatches(batchRes.data.batches || []);
      setBranches(branchRes.data.branches || []);
      setCategories(catRes.data.categories || []);
    } catch (err) {
      console.error("fetchAll error", err.response ?? err);
      setMessage("Failed to fetch admin data");
    } finally {
      setLoading(false);
    }
  };

  // ----- Tutors -----
  const handleTutorCreate = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await adminAxios.post("/admin/tutors", tutorForm);
      setTutors(prev => [res.data.tutor, ...prev]);
      setTutorForm({ name: "", email: "", password: "" });
      setMessage("Tutor created");
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.error || "Failed to create tutor");
    }
  };

  const handleTutorCsvUpload = async (e) => {
    e.preventDefault();
    const file = tutorCsvRef.current?.files?.[0];
    if (!file) return setMessage("Select CSV file first");
    setMessage("Uploading CSV...");
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await adminAxios.post("/admin/tutors/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage(res.data.message || "CSV uploaded");
      fetchAll();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.error || "CSV upload failed");
    }
  };

  const handleDeleteTutor = async (id) => {
    if (!confirm("Delete tutor?")) return;
    try {
      await adminAxios.delete(`/admin/tutors/${id}`);
      setTutors(prev => prev.filter(t => t._id !== id));
      setMessage("Tutor deleted");
    } catch (err) {
      console.error(err);
      setMessage("Failed to delete tutor");
    }
  };

  // ----- Batch/Branch -----
  const handleAddBatch = async (e) => {
    e.preventDefault();
    try {
      const res = await adminAxios.post("/admin/batches", { name: batchName });
      setBatches(prev => [res.data.batch, ...prev]);
      setBatchName("");
      setMessage("Batch added");
    } catch (err) {
      console.error(err);
      setMessage("Failed to add batch");
    }
  };
  const handleAddBranch = async (e) => {
    e.preventDefault();
    try {
      const res = await adminAxios.post("/admin/branches", { name: branchName });
      setBranches(prev => [res.data.branch, ...prev]);
      setBranchName("");
      setMessage("Branch added");
    } catch (err) {
      console.error(err);
      setMessage("Failed to add branch");
    }
  };

  // ----- Categories -----
  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...categoryForm,
        maxPoints: categoryForm.maxPoints ? Number(categoryForm.maxPoints) : undefined,
      };
      const res = await adminAxios.post("/admin/categories", payload);
      setCategories(prev => [res.data.category, ...prev]);
      setCategoryForm({ name: "", description: "", maxPoints: "", minDuration: "" });
      setMessage("Category created");
    } catch (err) {
      console.error(err);
      setMessage("Failed to create category");
    }
  };

  const handleAddSubcategory = async (categoryId) => {
    if (!newSub.name || !newSub.points) return setMessage("Subcategory name + points required");
    try {
      const res = await adminAxios.post(`/admin/categories/${categoryId}/subcategory`, {
        name: newSub.name,
        points: Number(newSub.points),
        level: newSub.level || "",
      });
      // update local categories
      setCategories(prev => prev.map(c => (c._id === categoryId ? res.data.category : c)));
      setNewSub({ name: "", points: "", level: "" });
      setMessage("Subcategory added");
    } catch (err) {
      console.error(err);
      setMessage("Failed to add subcategory");
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm("Delete category?")) return;
    try {
      await adminAxios.delete(`/admin/categories/${id}`);
      setCategories(prev => prev.filter(c => c._id !== id));
      setMessage("Category deleted");
    } catch (err) {
      console.error(err);
      setMessage("Failed to delete category");
    }
  };

  const handleDeleteSub = async (categoryId, subId) => {
    if (!confirm("Delete subcategory?")) return;
    try {
      await adminAxios.delete(`/admin/categories/${categoryId}/subcategory/${subId}`);
      setCategories(prev => prev.map(c => {
        if (c._id !== categoryId) return c;
        return { ...c, subcategories: c.subcategories.filter(s => s._id !== subId) };
      }));
      setMessage("Subcategory deleted");
    } catch (err) {
      console.error(err);
      setMessage("Failed to delete subcategory");
    }
  };

  // ==== EXPORTERS ====
  const exportExcel = (data, filename = "export.xlsx") => {
    const XLSX = require("xlsx");
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, filename);
  };

  // UI
  return (
    <div className="admin-panel p-6">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-sm text-gray-600">Manage tutors, batches, branches and categories</p>
        </div>
        <div>
          <button className="btn" onClick={() => exportExcel(tutors.map(t => ({ Name: t.name, Email: t.email })) , "tutors.xlsx")}>
            <Download size={16} /> Export Tutors
          </button>
        </div>
      </header>

      <nav className="tabs flex gap-2 mb-4">
        <button className={`tab ${tab==="tutors" ? "active" : ""}`} onClick={() => setTab("tutors")}>Tutors</button>
        <button className={`tab ${tab==="batches" ? "active" : ""}`} onClick={() => setTab("batches")}>Batches</button>
        <button className={`tab ${tab==="branches" ? "active" : ""}`} onClick={() => setTab("branches")}>Branches</button>
        <button className={`tab ${tab==="categories" ? "active" : ""}`} onClick={() => setTab("categories")}>Categories</button>
      </nav>

      {message && <div className="mb-4 text-sm text-green-700">{message}</div>}

      <div className="content">
        {tab === "tutors" && (
          <section>
            <div className="grid gap-4 grid-cols-2">
              {/* create tutor */}
              <div className="card p-4">
                <h3 className="font-semibold mb-2">Add Tutor</h3>
                <form onSubmit={handleTutorCreate} className="space-y-2">
                  <input placeholder="Name" value={tutorForm.name} onChange={e => setTutorForm({...tutorForm, name: e.target.value})} className="input" />
                  <input placeholder="Email" value={tutorForm.email} onChange={e => setTutorForm({...tutorForm, email: e.target.value})} className="input" />
                  <input placeholder="Password" value={tutorForm.password} onChange={e => setTutorForm({...tutorForm, password: e.target.value})} className="input" />
                  <button className="btn-primary" type="submit"><UserPlus size={14}/> Create Tutor</button>
                </form>
              </div>

              {/* CSV upload */}
              <div className="card p-4">
                <h3 className="font-semibold mb-2">Upload Tutors (CSV)</h3>
                <p className="text-sm text-gray-600 mb-2">CSV must contain: name,email,password (header names)</p>
                <form onSubmit={handleTutorCsvUpload} className="space-y-2">
                  <input ref={tutorCsvRef} type="file" accept=".csv" />
                  <button className="btn" type="submit"><FilePlus size={14}/> Upload CSV</button>
                </form>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold mb-2">All Tutors</h3>
              <div className="overflow-auto">
                <table className="w-full table-auto">
                  <thead><tr className="bg-gray-100"><th className="p-2">Name</th><th>Email</th><th>Actions</th></tr></thead>
                  <tbody>
                    {tutors.map(t => (
                      <tr key={t._id} className="border-b">
                        <td className="p-2">{t.name}</td>
                        <td className="p-2">{t.email}</td>
                        <td className="p-2">
                          <button onClick={() => navigator.clipboard.writeText(t.email)} className="btn small">Copy Email</button>
                          <button onClick={() => handleDeleteTutor(t._id)} className="btn small danger"><Trash2 size={14}/> Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {tab === "batches" && (
          <section>
            <div className="grid gap-4 grid-cols-2">
              <div className="card p-4">
                <h3>Add Batch</h3>
                <form onSubmit={handleAddBatch} className="space-y-2">
                  <input value={batchName} onChange={e=>setBatchName(e.target.value)} className="input" placeholder="e.g. 2022-2026" />
                  <button className="btn-primary" type="submit"><Plus size={14}/> Add Batch</button>
                </form>
              </div>
              <div className="card p-4">
                <h3>Add Branch</h3>
                <form onSubmit={handleAddBranch} className="space-y-2">
                  <input value={branchName} onChange={e=>setBranchName(e.target.value)} className="input" placeholder="e.g. CSE" />
                  <button className="btn-primary" type="submit"><Plus size={14}/> Add Branch</button>
                </form>
              </div>
            </div>

            <div className="mt-6">
              <h3>Batches</h3>
              <ul>
                {batches.map(b=> <li key={b._id} className="p-2 border-b">{b.name}</li>)}
              </ul>
              <h3 className="mt-4">Branches</h3>
              <ul>
                {branches.map(br=> <li key={br._id} className="p-2 border-b">{br.name}</li>)}
              </ul>
            </div>
          </section>
        )}

        {tab === "branches" && (
          <section>
            <p>Same as Batches tab (you can remove if you want separate screens).</p>
          </section>
        )}

        {tab === "categories" && (
          <section>
            <div className="grid grid-cols-2 gap-4">
              <div className="card p-4">
                <h3>{editingCategory ? "Edit Category" : "Add Category"}</h3>
                <form onSubmit={editingCategory ? async (e) => {
                  e.preventDefault();
                  // simplistic edit flow
                  try {
                    const upd = {...categoryForm, maxPoints: categoryForm.maxPoints ? Number(categoryForm.maxPoints) : undefined};
                    const res = await adminAxios.put(`/admin/categories/${editingCategory._id}`, upd);
                    setCategories(prev => prev.map(c => c._id === res.data.category._id ? res.data.category : c));
                    setEditingCategory(null);
                    setCategoryForm({ name: "", description: "", maxPoints: "", minDuration: "" });
                    setMessage("Category updated");
                  } catch (err) {
                    console.error(err);
                    setMessage("Failed to update category");
                  }
                } : handleAddCategory} className="space-y-2">
                  <input placeholder="Name" value={categoryForm.name} onChange={e=>setCategoryForm({...categoryForm, name: e.target.value})} className="input" />
                  <input placeholder="Description" value={categoryForm.description} onChange={e=>setCategoryForm({...categoryForm, description: e.target.value})} className="input" />
                  <input placeholder="Max Points" value={categoryForm.maxPoints} onChange={e=>setCategoryForm({...categoryForm, maxPoints: e.target.value})} className="input" />
                  <input placeholder="Min Duration" value={categoryForm.minDuration} onChange={e=>setCategoryForm({...categoryForm, minDuration: e.target.value})} className="input" />
                  <button className="btn-primary" type="submit">{editingCategory ? "Save Changes" : "Create Category"}</button>
                  {editingCategory && <button type="button" className="btn" onClick={()=>{ setEditingCategory(null); setCategoryForm({ name: "", description: "", maxPoints: "", minDuration: "" })}}>Cancel</button>}
                </form>
              </div>

              <div className="card p-4">
                <h3>Add Subcategory (select category below)</h3>
                <div className="space-y-2">
                  <input placeholder="Subcategory name" className="input" value={newSub.name} onChange={e=>setNewSub({...newSub, name: e.target.value})} />
                  <input placeholder="Points" className="input" value={newSub.points} onChange={e=>setNewSub({...newSub, points: e.target.value})} />
                  <input placeholder="Level (optional)" className="input" value={newSub.level} onChange={e=>setNewSub({...newSub, level: e.target.value})} />
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Click the + icon on a category to add this subcategory into it</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3>Categories</h3>
              <div className="space-y-4">
                {categories.map(cat => (
                  <div key={cat._id} className="card p-4 border">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{cat.name}</h4>
                        <p className="text-sm text-gray-600">{cat.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="btn" onClick={()=>{
                          setEditingCategory(cat);
                          setCategoryForm({ name: cat.name, description: cat.description || "", maxPoints: cat.maxPoints || "", minDuration: cat.minDuration || ""});
                        }}><Edit size={14}/> Edit</button>

                        <button className="btn" onClick={()=> handleAddSubcategory(cat._id)} title="Add subcategory (use inputs on left)">
                          <Plus size={14}/> Add Sub
                        </button>

                        <button className="btn danger" onClick={()=>handleDeleteCategory(cat._id)}><Trash2 size={14}/> Delete</button>
                      </div>
                    </div>

                    <div className="mt-3">
                      <strong>Subcategories:</strong>
                      <ul className="mt-2">
                        {cat.subcategories?.map(s => (
                          <li key={s._id} className="flex items-center justify-between p-2 border-b">
                            <div>
                              <span className="font-medium">{s.name}</span>
                              <span className="ml-2 text-sm text-gray-600">({s.points} pts {s.level ? `- ${s.level}` : ""})</span>
                            </div>
                            <div>
                              <button className="btn small" onClick={()=>handleDeleteSub(cat._id, s._id)}><Trash2 size={14}/> Remove</button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}