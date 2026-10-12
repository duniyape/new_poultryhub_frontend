
import { Search, Plus, Mail, MoreHorizontal, X, Pencil } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

const getAvatarColor = (name) => {
  const colors = [
    'bg-blue-100 text-blue-700',
    'bg-purple-100 text-purple-700',
    'bg-rose-100 text-rose-700',
    'bg-amber-100 text-amber-700',
    'bg-emerald-100 text-emerald-700',
    'bg-indigo-100 text-indigo-700',
  ];
  const index = name.length % colors.length;
  return colors[index];
};

const App = () => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
  name: '',
  role: '',
  dept: '',
  email: '',
  password: ''
});

const navigate = useNavigate();


  const filtered = employees.filter(emp => 
    emp.name.toLowerCase().includes(search.toLowerCase()) ||
    emp.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
  setEditingId(null);
  setFormData({ name: '', role: '', dept: '', email: '', password: '' });
  setIsModalOpen(true);
};

  const handleOpenEdit = (emp) => {
  setEditingId(emp.id);
  setFormData({
    name: emp.name,
    role: emp.role,
    dept: emp.dept || '',
    email: emp.email || '',
    password: ''   // keep empty
  });
  setIsModalOpen(true);
};

  useEffect(() => {
  fetchEmployees();
}, []);

const fetchEmployees = async () => {
  try {
    const res = await fetch("https://apipoultry.duniyape.in/employees");
    const data = await res.json();
    setEmployees(data);
  } catch (err) {
    console.error("Failed to load employees", err);
  }
};

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!formData.name || !formData.role) return;

  try {
    if (editingId) {
      // UPDATE
      await fetch(`https://apipoultry.duniyape.in/employees/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
    } else {
      // CREATE
      await fetch("https://apipoultry.duniyape.in/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
    }

    await fetchEmployees(); // refresh list
    setIsModalOpen(false);
  } catch (err) {
    console.error("Save failed", err);
  }
};


  return (
    <div className="min-h-screen bg-white text-slate-900 p-6 md:p-12 font-sans relative">
      <div className="max-w-3xl mx-auto">
        {/* Simple Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
  <div className="flex items-center gap-3">
    <button
      onClick={() => navigate(-1)}
      className="px-3 py-1.5 rounded-lg border border-slate-300 text-sm hover:bg-slate-100 transition"
    >
      ← Back
    </button>

    <div>
      <h1 className="text-2xl font-bold">Employees</h1>
      <p className="text-slate-500 text-sm">
        Manage your team members and their roles.
      </p>
    </div>
  </div>

  <button 
    onClick={handleOpenAdd}
    className="flex items-center justify-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-all active:scale-95"
  >
    <Plus className="w-4 h-4" />
    Add New
  </button>
</div>


        {/* Search Input */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search by name or role..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Simplified List */}
        <div className="space-y-1">
          {filtered.map((emp) => (
            <div 
              key={emp.id} 
              className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg uppercase transition-transform group-hover:scale-105 ${getAvatarColor(emp.name)}`}>
                  {emp.name.charAt(0)}
                </div>
                
                <div>
                  <h3 className="font-semibold text-slate-800">{emp.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span>{emp.role}</span>
                    {emp.dept && (
                      <>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span>{emp.dept}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <a 
                  href={`mailto:${emp.email}`}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                >
                  <Mail className="w-5 h-5" />
                </a>
                <button 
                  onClick={() => handleOpenEdit(emp)}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  title="Edit Employee"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-all">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              No results found for "{search}"
            </div>
          )}
        </div>
      </div>

      {/* Employee Modal (Add/Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-[2px]">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
              <h2 className="text-lg font-bold">{editingId ? 'Edit Employee' : 'New Employee'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Full Name</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-200 outline-none transition-all"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Alex Johnson"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Role</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-200 outline-none"
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value})}
                    placeholder="Designer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Department</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-200 outline-none"
                    value={formData.dept}
                    onChange={e => setFormData({...formData, dept: e.target.value})}
                    placeholder="Product"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email</label>
                <input 
                  type="email" 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-200 outline-none"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="alex@company.com"
                />
              </div>

              <div>
  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
    Password
  </label>
  <input
    type="password"
    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-200 outline-none"
    value={formData.password}
    onChange={e => setFormData({ ...formData, password: e.target.value })}
    placeholder={editingId ? "Leave blank to keep unchanged" : "Set password"}
  />
</div>
              <button 
                type="submit"
                className="w-full bg-black text-white py-2.5 rounded-xl font-bold mt-2 hover:bg-slate-800 transition-all active:scale-[0.98]"
              >
                {editingId ? 'Save Changes' : 'Add to Team'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;