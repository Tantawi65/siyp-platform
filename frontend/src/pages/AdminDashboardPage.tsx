import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Clock, CheckCircle, ShieldCheck, Building2, Check, X, CheckSquare, Trash2, Edit3, Eye, Shield, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../layouts/Navbar';

interface Opportunity {
  id: number; title: string; organization: string; opportunity_type: string;
  country: string; deadline: string; status: string;
}

interface User {
  id: number; email: string; role: string; is_active: boolean; joined: string;
}

interface Program {
  id: number; name: string; organization: string; country: string;
}

type Tab = 'pending_opps' | 'all_opps' | 'programs' | 'admins' | 'all_users';

const UserRow: React.FC<{ u: any; makeAdmin: (id: number) => void; deleteUser: (id: number) => void; }> = ({ u, makeAdmin, deleteUser }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <tr className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
      <td className="py-4 hidden md:table-cell">#{u.id}</td>
      <td className="py-4 font-medium truncate max-w-[150px] md:max-w-none">{u.email}</td>
      <td className="py-4">
        <span className={`px-2 py-1 rounded-md text-[10px] md:text-xs font-semibold ${u.role === 'owner' ? 'bg-purple-50 text-purple-600' : u.role === 'admin' ? 'bg-[#1B5442]/10 text-[#1B5442]' : 'bg-gray-100 text-gray-600'}`}>
          {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
        </span>
      </td>
      <td className="py-4 hidden md:table-cell">
        <span className={`flex items-center gap-1.5 text-xs font-medium ${u.is_active ? 'text-green-600' : 'text-gray-400'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
          {u.is_active ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="py-4 text-right relative">
        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center justify-end gap-2">
          <Link to={`/profile/${u.id}`} target="_blank" className="p-2 lg:px-3 lg:py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors" title="View Profile">
            <Eye size={14} className="shrink-0" />
            <span>View Profile</span>
          </Link>
          {u.role === 'user' && (
            <button onClick={() => makeAdmin(u.id)} className="p-2 lg:px-3 lg:py-1.5 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors" title="Make Admin">
              <Shield size={14} className="shrink-0" />
              <span>Make Admin</span>
            </button>
          )}
          {u.role !== 'owner' && (
            <button onClick={() => deleteUser(u.id)} className="p-2 lg:px-3 lg:py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors" title="Remove Account">
              <Trash2 size={14} className="shrink-0" />
              <span>Remove</span>
            </button>
          )}
        </div>
        
        {/* Mobile Dropdown Modal (Bottom Sheet style) */}
        <div className="lg:hidden flex items-center justify-end">
          <button onClick={() => setMenuOpen(true)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreHorizontal size={18} />
          </button>
          {menuOpen && (
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-0">
              <div className="absolute inset-0 bg-[#1A1A2E]/40 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
              <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                  <div className="text-left">
                    <h3 className="font-bold text-[#1A1A2E] text-sm">Manage User</h3>
                    <p className="text-xs text-gray-500 truncate max-w-[200px]">{u.email}</p>
                  </div>
                  <button onClick={() => setMenuOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full">
                    <X size={18} />
                  </button>
                </div>
                <div className="flex flex-col pb-2">
                  <Link to={`/profile/${u.id}`} target="_blank" className="w-full flex items-center gap-4 px-5 py-3.5 text-sm font-semibold hover:bg-gray-50 text-gray-700 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"><Eye size={16} /></div> 
                    View Profile
                  </Link>
                  {u.role === 'user' && (
                    <button onClick={() => { makeAdmin(u.id); setMenuOpen(false); }} className="w-full flex items-center gap-4 px-5 py-3.5 text-sm font-semibold hover:bg-gray-50 text-gray-700 border-t border-gray-50 transition-colors text-left">
                      <div className="w-8 h-8 rounded-full bg-yellow-50 text-yellow-600 flex items-center justify-center"><Shield size={16} /></div> 
                      Make Admin
                    </button>
                  )}
                  {u.role !== 'owner' && (
                    <button onClick={() => { deleteUser(u.id); setMenuOpen(false); }} className="w-full flex items-center gap-4 px-5 py-3.5 text-sm font-semibold text-red-600 hover:bg-red-50 border-t border-gray-50 transition-colors text-left">
                      <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center"><Trash2 size={16} /></div> 
                      Remove Account
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const isOwner = user?.role === 'owner';
  
  const [activeTab, setActiveTab] = useState<Tab>('pending_opps');
  const [pendingOpps, setPendingOpps] = useState<Opportunity[]>([]);
  const [allOpps, setAllOpps] = useState<Opportunity[]>([]);
  const [admins, setAdmins] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [pendingPrograms, setPendingPrograms] = useState<Program[]>([]);
  const [masterPrograms, setMasterPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals State
  const [mergeModalOpen, setMergeModalOpen] = useState(false);
  const [programToMerge, setProgramToMerge] = useState<Program | null>(null);
  const [selectedMasterId, setSelectedMasterId] = useState<number | ''>('');
  
  const [addProgModalOpen, setAddProgModalOpen] = useState(false);
  const [newProgName, setNewProgName] = useState('');
  const [newProgOrg, setNewProgOrg] = useState('');
  const [newProgCountry, setNewProgCountry] = useState('');

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };
        
        const resPending = await fetch('/api/admin/opportunities/pending', { headers });
        if (resPending.ok) setPendingOpps(await resPending.json());

        const resAll = await fetch('/api/admin/opportunities', { headers });
        if (resAll.ok) setAllOpps(await resAll.json());

        if (isOwner) {
          const resAdmins = await fetch('/api/admin/admins', { headers });
          if (resAdmins.ok) setAdmins(await resAdmins.json());
          
          const resAllUsers = await fetch('/api/admin/users', { headers });
          if (resAllUsers.ok) setAllUsers(await resAllUsers.json());
          
          const resAllProgs = await fetch('/api/profiles/programs', { headers });
          if (resAllProgs.ok) {
            const progs = await resAllProgs.json();
            setPendingPrograms(progs); // we'll use pendingPrograms state for ALL programs now
            setMasterPrograms(progs.filter((p: any) => p.verified));
          }
        }
      } catch (err) {
        console.error('Failed to fetch admin data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const approveOpp = async (id: number) => {
    try {
      await fetch(`/api/admin/opportunities/${id}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setPendingOpps(prev => prev.filter(p => p.id !== id));
      // Update in all opps too
      setAllOpps(prev => prev.map(p => p.id === id ? { ...p, status: 'approved' } : p));
    } catch (e) { console.error(e); }
  };

  const rejectOpp = async (id: number) => {
    try {
      await fetch(`/api/admin/opportunities/${id}/reject`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setPendingOpps(prev => prev.filter(p => p.id !== id));
      setAllOpps(prev => prev.map(p => p.id === id ? { ...p, status: 'rejected' } : p));
    } catch (e) { console.error(e); }
  };

  const deleteOpp = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this opportunity?")) return;
    try {
      await fetch(`/api/admin/opportunities/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setPendingOpps(prev => prev.filter(p => p.id !== id));
      setAllOpps(prev => prev.filter(p => p.id !== id));
    } catch (e) { console.error(e); }
  };

  const approveProgram = async (id: number) => {
    try {
      await fetch(`/api/admin/programs/${id}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setPendingPrograms(prev => prev.map(p => p.id === id ? { ...p, verified: true } : p));
      setMasterPrograms(prev => [...prev, pendingPrograms.find(p => p.id === id)!]);
    } catch (e) { console.error(e); }
  };

  const rejectProgram = async (id: number) => {
    if (!window.confirm("Rejecting will completely delete this program. Proceed?")) return;
    try {
      await fetch(`/api/admin/programs/${id}/reject`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setPendingPrograms(prev => prev.filter(p => p.id !== id));
    } catch (e) { console.error(e); }
  };

  const openMergeModal = (program: Program) => {
    setProgramToMerge(program);
    setSelectedMasterId('');
    setMergeModalOpen(true);
  };

  const mergeProgram = async () => {
    if (!programToMerge || !selectedMasterId) return;
    try {
      await fetch(`/api/admin/programs/${programToMerge.id}/merge`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ master_program_id: selectedMasterId })
      });
      setPendingPrograms(prev => prev.filter(p => p.id !== programToMerge.id));
      setMergeModalOpen(false);
    } catch (e) { console.error(e); }
  };

  const createProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/profiles/programs`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newProgName, organization: newProgOrg, country: newProgCountry, description: '' })
      });
      if (res.ok) {
        const p = await res.json();
        setPendingPrograms(prev => [p, ...prev]);
        setMasterPrograms(prev => [p, ...prev]);
        setAddProgModalOpen(false);
        setNewProgName(''); setNewProgOrg(''); setNewProgCountry('');
      } else {
        alert('Failed: ' + (await res.json()).detail);
      }
    } catch (e) { console.error(e); }
  };

  const makeAdmin = async (id: number) => {
    if (!window.confirm("Promote this user to Admin?")) return;
    try {
      const res = await fetch(`/api/admin/admins/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setAllUsers(prev => prev.map(u => u.id === id ? { ...u, role: 'admin' } : u));
        const updatedUser = allUsers.find(u => u.id === id);
        if (updatedUser) setAdmins(prev => [...prev, { ...updatedUser, role: 'admin' }]);
      } else {
        const err = await res.json();
        alert('Failed to promote: ' + err.detail);
      }
    } catch (e) { console.error(e); }
  };

  const deleteUser = async (id: number) => {
    if (!window.confirm("Are you sure you want to permanently delete this user?")) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setAllUsers(prev => prev.filter(u => u.id !== id));
        setAdmins(prev => prev.filter(a => a.id !== id));
      } else {
        const err = await res.json();
        alert('Failed to delete: ' + err.detail);
      }
    } catch (e) { console.error(e); }
  };

  const removeAdmin = async (id: number) => {
    if (!window.confirm("Remove this user's admin privileges?")) return;
    try {
      const res = await fetch(`/api/admin/admins/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setAdmins(prev => prev.filter(a => a.id !== id));
        setAllUsers(prev => prev.map(u => u.id === id ? { ...u, role: 'user' } : u));
      } else {
        const err = await res.json();
        alert('Failed to remove: ' + err.detail);
      }
    } catch (e) { console.error(e); }
  };

  return (
    <div className="bg-[#F8F7F4] min-h-screen flex flex-col">
      <Navbar />

      <div className="bg-[#1B5442] pt-[72px]">
        <div className="container-max py-10">
          <span className="badge bg-white/20 text-white/90 mb-4">Admin</span>
          <h1 className="text-3xl font-black text-white mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Admin Dashboard</h1>
          <p className="text-white/70">Manage platform content and personnel.</p>
        </div>
      </div>

      <main className="container-max py-8 flex-grow">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center text-yellow-600">
              <Clock size={20} />
            </div>
            <div>
            <div className="text-2xl font-black text-[#1A1A2E]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{pendingOpps.length}</div>
              <div className="text-sm text-gray-400">Pending Review</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
              <CheckCircle size={20} />
            </div>
            <div>
              <div className="text-2xl font-black text-[#1A1A2E]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>124</div>
              <div className="text-sm text-gray-400">Approved This Month</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#A8D5C4]/60 flex items-center justify-center text-[#1B5442]">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="text-2xl font-black text-[#1A1A2E]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{admins.length}</div>
              <div className="text-sm text-gray-400">Active Admins</div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 bg-white border border-gray-100 shadow-sm rounded-2xl p-1.5 mb-6 w-fit">
          <button
            onClick={() => setActiveTab('pending_opps')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'pending_opps' ? 'bg-[#1B5442] text-white shadow-sm' : 'text-gray-500 hover:text-[#1A1A2E]'
            }`}
          >
            Pending Opportunities ({pendingOpps.length})
          </button>
          <button
            onClick={() => setActiveTab('all_opps')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'all_opps' ? 'bg-[#1B5442] text-white shadow-sm' : 'text-gray-500 hover:text-[#1A1A2E]'
            }`}
          >
            All Opportunities
          </button>
          
          {isOwner && (
            <>
              <button
                onClick={() => setActiveTab('programs')}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === 'programs' ? 'bg-[#1B5442] text-white shadow-sm' : 'text-gray-500 hover:text-[#1A1A2E]'
                }`}
              >
                Custom Programs ({pendingPrograms.length})
              </button>
              <button
                onClick={() => setActiveTab('admins')}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === 'admins' ? 'bg-[#1B5442] text-white shadow-sm' : 'text-gray-500 hover:text-[#1A1A2E]'
                }`}
              >
                Manage Admins
              </button>
              <button
                onClick={() => setActiveTab('all_users')}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === 'all_users' ? 'bg-[#1B5442] text-white shadow-sm' : 'text-gray-500 hover:text-[#1A1A2E]'
                }`}
              >
                All Users ({allUsers.length})
              </button>
            </>
          )}
        </div>

        {activeTab === 'pending_opps' && (
          <div className="flex flex-col gap-4">
            {loading ? (
              <p className="text-gray-500 text-center py-10">Loading pending opportunities...</p>
            ) : pendingOpps.length > 0 ? pendingOpps.map(opp => (
              <div key={opp.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-[#1B5442]/30 transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 uppercase tracking-wider">{opp.opportunity_type}</span>
                    <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={10} /> Pending Review</span>
                  </div>
                  <h4 className="font-bold text-[#1A1A2E] text-[15px] mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{opp.title}</h4>
                  <p className="text-xs text-gray-500 flex items-center gap-3">
                    <span className="flex items-center gap-1"><Building2 size={11} /> {opp.organization}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Link to={`/opportunities/${opp.id}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-semibold transition-colors">
                    View
                  </Link>
                  <Link to={`/opportunities/${opp.id}/edit`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-2 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 rounded-lg text-sm font-semibold transition-colors">
                    <Edit3 size={14} /> Edit
                  </Link>
                  <button onClick={() => approveOpp(opp.id)} className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-sm font-semibold transition-colors">
                    <Check size={14} /> Approve
                  </button>
                  <button onClick={() => rejectOpp(opp.id)} className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-semibold transition-colors">
                    <X size={14} /> Reject
                  </button>
                </div>
              </div>
            )) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <CheckSquare size={32} className="text-gray-300 mx-auto mb-3" />
                <h3 className="font-bold text-[#1A1A2E] mb-1">All caught up!</h3>
                <p className="text-sm text-gray-500">There are no pending opportunities to review.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'all_opps' && (
          <div className="flex flex-col gap-4">
            {loading ? (
              <p className="text-gray-500 text-center py-10">Loading opportunities...</p>
            ) : allOpps.length > 0 ? allOpps.map(opp => (
              <div key={opp.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-[#1B5442]/30 transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 uppercase tracking-wider">{opp.opportunity_type}</span>
                    <span className={`text-xs flex items-center gap-1 ${opp.status === 'approved' ? 'text-green-600' : opp.status === 'rejected' ? 'text-red-500' : 'text-gray-400'}`}>
                      {opp.status.toUpperCase()}
                    </span>
                  </div>
                  <h4 className="font-bold text-[#1A1A2E] text-[15px] mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{opp.title}</h4>
                  <p className="text-xs text-gray-500 flex items-center gap-3">
                    <span className="flex items-center gap-1"><Building2 size={11} /> {opp.organization}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link to={`/opportunities/${opp.id}/edit`} className="flex items-center gap-1.5 px-4 py-2 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 rounded-lg text-sm font-semibold transition-colors">
                    <Edit3 size={14} /> Edit
                  </Link>
                  <button onClick={() => deleteOpp(opp.id)} className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-semibold transition-colors">
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            )) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <p className="text-sm text-gray-500">No opportunities found.</p>
              </div>
            )}
          </div>
        )}

        {isOwner && activeTab === 'programs' && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-gray-100 shadow-sm mb-2">
              <p className="text-sm text-gray-500 font-semibold">{pendingPrograms.length} total programs</p>
              <button onClick={() => setAddProgModalOpen(true)} className="btn-primary text-sm px-4 py-2">Add Program</button>
            </div>
            {loading ? (
              <p className="text-gray-500 text-center py-10">Loading programs...</p>
            ) : pendingPrograms.length > 0 ? pendingPrograms.map((prog: any) => (
              <div key={prog.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    {prog.verified ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-600 uppercase tracking-wider flex items-center gap-1"><Check size={10} /> Verified</span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-600 uppercase tracking-wider flex items-center gap-1"><Clock size={10} /> Pending</span>
                    )}
                  </div>
                  <h4 className="font-bold text-[#1A1A2E] text-[15px] mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{prog.name}</h4>
                  <p className="text-xs text-gray-500">
                    {prog.organization} • {prog.country}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!prog.verified && (
                    <button onClick={() => approveProgram(prog.id)} className="px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-xs font-semibold">Approve</button>
                  )}
                  <button onClick={() => openMergeModal(prog)} className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-semibold">Merge</button>
                  <button onClick={() => rejectProgram(prog.id)} className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-semibold">Delete</button>
                </div>
              </div>
            )) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <CheckSquare size={32} className="text-gray-300 mx-auto mb-3" />
                <h3 className="font-bold text-[#1A1A2E] mb-1">No programs found</h3>
              </div>
            )}
          </div>
        )}

        {isOwner && activeTab === 'admins' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex justify-between items-center mb-5">
              <p className="text-sm text-gray-500">{admins.length} administrators</p>
            </div>
            {loading ? (
              <p className="text-gray-500 text-center py-10">Loading admins...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400">
                      <th className="py-4 font-semibold">User</th>
                      <th className="py-4 font-semibold">Role</th>
                      <th className="py-4 font-semibold">Status</th>
                      <th className="py-4 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.map(admin => (
                      <tr key={admin.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#1B5442] flex items-center justify-center text-white font-bold text-xs">
                              {admin.email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-gray-500 text-xs">{admin.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-semibold ${admin.role === 'owner' ? 'bg-purple-50 text-purple-600' : 'bg-[#1B5442]/10 text-[#1B5442]'}`}>
                            {admin.role.charAt(0).toUpperCase() + admin.role.slice(1)}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className={`flex items-center gap-1.5 text-xs font-medium ${admin.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${admin.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                            {admin.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          {admin.role !== 'owner' && (
                            <button onClick={() => removeAdmin(admin.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {isOwner && activeTab === 'all_users' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex justify-between items-center mb-5">
              <p className="text-sm text-gray-500">{allUsers.length} total users registered</p>
            </div>
            {loading ? (
              <p className="text-gray-500 text-center py-10">Loading users...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400">
                      <th className="py-4 font-semibold hidden md:table-cell">User ID</th>
                      <th className="py-4 font-semibold">Email</th>
                      <th className="py-4 font-semibold">Role</th>
                      <th className="py-4 font-semibold hidden md:table-cell">Status</th>
                      <th className="py-4 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map(u => (
                      <UserRow key={u.id} u={u} makeAdmin={makeAdmin} deleteUser={deleteUser} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Merge Modal */}
      {mergeModalOpen && programToMerge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A2E]/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-bold text-lg text-[#1A1A2E]">Merge Program</h3>
              <p className="text-sm text-gray-500">Select the official program to merge "{programToMerge.name}" into.</p>
            </div>
            <div className="p-5">
              <label className="block text-sm font-semibold text-[#1A1A2E] mb-2">Master Program</label>
              <select
                value={selectedMasterId}
                onChange={e => setSelectedMasterId(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:border-[#1B5442] focus:ring-1 focus:ring-[#1B5442] text-sm mb-4"
              >
                <option value="" disabled>Select the master program...</option>
                {masterPrograms.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="p-5 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setMergeModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700">Cancel</button>
              <button onClick={mergeProgram} disabled={!selectedMasterId} className="px-4 py-2 bg-[#1B5442] text-white rounded-lg text-sm font-semibold hover:bg-[#154233] disabled:opacity-50 transition-colors">Merge & Delete Duplicate</button>
            </div>
          </div>
        </div>
      )}



      {/* Add Program Modal */}
      {addProgModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A2E]/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-bold text-lg text-[#1A1A2E]">Add Custom Program</h3>
              <p className="text-sm text-gray-500">This will be instantly verified and added to the database.</p>
            </div>
            <form onSubmit={createProgram}>
              <div className="p-5 flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#1A1A2E] mb-1.5">Program Name</label>
                  <input type="text" required value={newProgName} onChange={e => setNewProgName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:border-[#1B5442] focus:ring-1 focus:ring-[#1B5442] text-sm" placeholder="e.g. Harvard Scholarship" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1A1A2E] mb-1.5">Organization</label>
                  <input type="text" required value={newProgOrg} onChange={e => setNewProgOrg(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:border-[#1B5442] focus:ring-1 focus:ring-[#1B5442] text-sm" placeholder="e.g. Harvard University" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1A1A2E] mb-1.5">Country</label>
                  <input type="text" required value={newProgCountry} onChange={e => setNewProgCountry(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:border-[#1B5442] focus:ring-1 focus:ring-[#1B5442] text-sm" placeholder="e.g. USA" />
                </div>
              </div>
              <div className="p-5 bg-gray-50 flex justify-end gap-3">
                <button type="button" onClick={() => setAddProgModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#1B5442] text-white rounded-lg text-sm font-semibold hover:bg-[#154233] transition-colors">Add Program</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
