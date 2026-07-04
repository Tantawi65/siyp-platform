import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Compass, GripVertical, Clock, Building2, MoreHorizontal, Trash2 } from 'lucide-react';
import Navbar from '../layouts/Navbar';

const COLUMNS = [
  { id: 'interested', label: 'Interested', color: 'bg-gray-100 text-gray-600', dotColor: 'bg-gray-400' },
  { id: 'preparing', label: 'Preparing', color: 'bg-blue-100 text-blue-700', dotColor: 'bg-blue-500' },
  { id: 'applied', label: 'Applied', color: 'bg-yellow-100 text-yellow-700', dotColor: 'bg-yellow-500' },
  { id: 'accepted', label: 'Accepted', color: 'bg-green-100 text-green-700', dotColor: 'bg-green-500' },
];

interface SavedOpportunity {
  id: number;
  status: string;
  opportunity: {
    id: number;
    title: string;
    organization: string;
    opportunity_type: string;
    deadline: string;
  };
}

const typeColors: Record<string, string> = {
  Scholarship: 'text-blue-600 bg-blue-50',
  Fellowship: 'text-purple-600 bg-purple-50',
  Internship: 'text-orange-600 bg-orange-50',
  Conference: 'text-cyan-600 bg-cyan-50',
  Volunteer: 'text-[#1B5442] bg-[#A8D5C4]/30',
  Grant: 'text-red-600 bg-red-50',
  Competition: 'text-yellow-600 bg-yellow-50',
};

const ApplicationCard: React.FC<{ card: SavedOpportunity; onMove: (id: number, status: string) => void; onRemove: (id: number) => void }> = ({ card, onMove, onRemove }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const otherStatuses = COLUMNS.filter(c => c.id !== card.status);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const opp = card.opportunity;
  const formattedDate = opp.deadline ? new Date(opp.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all relative">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-md mb-2 inline-block ${typeColors[opp.opportunity_type] || 'text-gray-600 bg-gray-50'}`}>{opp.opportunity_type}</span>
          <Link to={`/opportunities/${opp.id}`} className="block hover:text-[#1B5442] transition-colors">
            <h4 className="font-semibold text-[#1A1A2E] text-sm leading-snug" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{opp.title}</h4>
          </Link>
        </div>
        <div className="relative" ref={menuRef}>
          <button onClick={() => setMenuOpen(!menuOpen)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors shrink-0">
            <MoreHorizontal size={14} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 bg-white border border-gray-100 shadow-xl rounded-xl w-44 z-20 overflow-hidden">
              {otherStatuses.map(s => (
                <button key={s.id} onClick={() => { onMove(card.id, s.id); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 text-gray-700">
                  Move to {s.label}
                </button>
              ))}
              <button onClick={() => { onRemove(card.id); setMenuOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2 border-t border-gray-100">
                <Trash2 size={13} /> Remove
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400">
        <span className="flex items-center gap-1"><Building2 size={11} /> {opp.organization}</span>
        <span className="flex items-center gap-1 text-red-400 font-medium"><Clock size={11} /> {formattedDate}</span>
      </div>
    </div>
  );
};

const DashboardPage: React.FC = () => {
  const [cards, setCards] = useState<SavedOpportunity[]>([]);
  const [loading, setLoading] = useState(true);

  // Drag to scroll logic
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // scroll speed multiplier
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  React.useEffect(() => {
    fetch('/api/tracker', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setCards(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const moveCard = (id: number, newStatus: string) => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    fetch(`/api/tracker/${id}`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: newStatus })
    }).catch(err => console.error('Failed to move card:', err));
  };

  const removeCard = (id: number) => {
    setCards(prev => prev.filter(c => c.id !== id));
    fetch(`/api/tracker/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }).catch(err => console.error('Failed to remove card:', err));
  };

  return (
    <div className="bg-[#F8F7F4] min-h-screen flex flex-col">
      <Navbar />

      <div className="bg-[#1B5442] pt-[72px]">
        <div className="container-max py-8 sm:py-10">
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-1.5" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Application Tracker</h1>
          <p className="text-sm sm:text-base text-white/70">Manage your entire opportunity pipeline in one place.</p>
        </div>
      </div>

      <main className="container-max py-8 flex-grow flex flex-col">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <p className="text-sm text-gray-500 font-medium">{cards.length} applications tracked</p>
          <Link to="/explore" className="btn-primary text-sm px-5 py-2.5 gap-1.5 w-full sm:w-auto justify-center">
            <Plus size={15} /> Add Opportunity
          </Link>
        </div>

        {/* Kanban Board */}
        <div 
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className={`flex gap-5 overflow-x-auto pb-4 no-scrollbar flex-1 items-start ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
        >
          {COLUMNS.map(col => {
            const colCards = cards.filter(c => c.status === col.id);
            return (
              <div key={col.id} className="w-[300px] shrink-0 flex flex-col rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
                {/* Column Header */}
                <div className="p-4 flex items-center justify-between border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                    <h3 className="font-bold text-sm text-[#1A1A2E]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{col.label}</h3>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.color}`}>{colCards.length}</span>
                </div>

                {/* Cards */}
                <div className="p-3 flex flex-col gap-3 flex-grow min-h-[300px]">
                  {colCards.map(card => (
                    <ApplicationCard key={card.id} card={card} onMove={moveCard} onRemove={removeCard} />
                  ))}

                  {colCards.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-100 rounded-xl p-6 text-center min-h-[200px]">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                        <GripVertical size={18} className="text-gray-300" />
                      </div>
                      <p className="text-xs text-gray-300 font-medium">No applications here</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-pulse-ring w-12 h-12 rounded-full bg-[#1B5442] opacity-50"></div>
          </div>
        ) : cards.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center flex-1">
            <div className="text-5xl">📋</div>
            <h3 className="text-xl font-bold" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Start tracking applications</h3>
            <p className="text-gray-500 max-w-sm">Explore opportunities and save them to start building your pipeline.</p>
            <Link to="/explore" className="btn-primary">
              <Compass size={16} /> Explore Opportunities
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
