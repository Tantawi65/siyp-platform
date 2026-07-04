import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Building2, Clock, X, Bookmark, ExternalLink, ChevronDown, ChevronUp, Edit3 } from 'lucide-react';
import Navbar from '../layouts/Navbar';
import Footer from '../layouts/Footer';
import { useAuth } from '../context/AuthContext';

interface Tag { id: number; name: string; }
interface Author { id: number; email: string; profile?: { name?: string }; }
interface Opportunity {
  id: number; title: string; organization: string; country: string;
  opportunity_type: string; funding_type: string; deadline: string;
  description: string; tags: Tag[]; author: Author;
}

const TYPES = ['Scholarship', 'Fellowship', 'Internship', 'Conference', 'Volunteer', 'Grant', 'Competition'];
const FUNDING_OPTIONS = ['Fully Funded', 'Partially Funded', 'Unpaid'];

const fundingColors: Record<string, string> = {
  'Fully Funded':     'bg-emerald-100 text-emerald-800',
  'Partially Funded': 'bg-amber-100 text-amber-800',
  'Unpaid':           'bg-gray-100 text-gray-600',
};

const typeColors: Record<string, string> = {
  Scholarship: 'bg-blue-100 text-blue-700',
  Fellowship:  'bg-purple-100 text-purple-700',
  Internship:  'bg-orange-100 text-orange-700',
  Conference:  'bg-cyan-100 text-cyan-700',
  Volunteer:   'bg-green-100 text-green-700',
  Grant:       'bg-red-100 text-red-700',
  Competition: 'bg-yellow-100 text-yellow-700',
};

// ─── Sidebar filter section ───────────────────────────────────
const FilterSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full mb-3 group"
      >
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest group-hover:text-[#1B5442] transition-colors">{title}</span>
        {open ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
      </button>
      {open && children}
    </div>
  );
};

// ─── Opportunity Card ─────────────────────────────────────────
const OpportunityCard: React.FC<{ opp: Opportunity, isAdmin: boolean, trackerId: number | null, onToggleSave: (oppId: number, trackerId: number | null) => void }> = ({ opp, isAdmin, trackerId, onToggleSave }) => {
  const [saving, setSaving] = useState(false);
  const isUrgent = new Date(opp.deadline).getTime() - new Date().getTime() < 14 * 24 * 60 * 60 * 1000;
  const formattedDate = opp.deadline ? new Date(opp.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
  
  const handleBookmarkClick = async () => {
    setSaving(true);
    await onToggleSave(opp.id, trackerId);
    setSaving(false);
  };

  return (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col">
    <div className="p-6 flex-grow flex flex-col">
      {/* Top row */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex flex-wrap gap-2">
          <span className={`badge ${typeColors[opp.opportunity_type] || 'bg-gray-100 text-gray-600'}`}>{opp.opportunity_type}</span>
          <span className={`badge ${fundingColors[opp.funding_type] || 'bg-gray-100 text-gray-600'}`}>{opp.funding_type}</span>
          {isUrgent && <span className="badge bg-red-100 text-red-600">🔥 Closing Soon</span>}
        </div>
        <button 
          onClick={handleBookmarkClick}
          disabled={saving}
          className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 ${trackerId ? 'text-[#1B5442] bg-[#1B5442]/10' : 'text-gray-300 hover:text-[#1B5442] hover:bg-[#1B5442]/10'}`}
        >
          <Bookmark size={16} className={trackerId ? "fill-[#1B5442]" : ""} />
        </button>
      </div>

      {/* Title */}
      <Link to={`/opportunities/${opp.id}`} className="hover:underline decoration-[#1B5442] decoration-2 underline-offset-2">
        <h3 className="font-bold text-[#1A1A2E] text-lg leading-snug mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          {opp.title}
        </h3>
      </Link>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-gray-500 mb-3">
        <span className="flex items-center gap-1.5"><Building2 size={13} /> {opp.organization}</span>
        <span className="flex items-center gap-1.5"><MapPin size={13} /> {opp.country}</span>
        <span className="flex items-center gap-1.5 text-red-500 font-medium"><Clock size={13} /> {formattedDate}</span>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">{opp.description}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {opp.tags?.map(t => (
          <span key={t.id} className="px-2.5 py-1 bg-gray-100 text-gray-500 text-xs rounded-lg font-medium">{t.name}</span>
        ))}
      </div>

      {/* Footer action */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
        <span className="text-xs text-gray-400">
          Posted by SIYP Team &bull; Wrote by {opp.author?.profile?.name || (opp.author ? opp.author.email.split('@')[0] : 'Unknown')}
        </span>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link
              to={`/opportunities/${opp.id}/edit`}
              className="flex items-center gap-1.5 px-3 py-2 bg-yellow-50 text-yellow-600 text-sm font-semibold rounded-lg hover:bg-yellow-100 transition-colors"
            >
              <Edit3 size={13} /> Edit
            </Link>
          )}
          <Link
            to={`/opportunities/${opp.id}`}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1B5442] text-white text-sm font-semibold rounded-lg hover:bg-[#2A7A60] transition-colors"
          >
            View Details <ExternalLink size={13} />
          </Link>
        </div>
      </div>
    </div>
  </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────
const ExplorePage: React.FC = () => {
  const { user } = useAuth();
  const isAdminOrOwner = user?.role === 'admin' || user?.role === 'owner';

  const [opportunities, setOpportunities] = React.useState<Opportunity[]>([]);
  const [trackerItems, setTrackerItems] = React.useState<Record<number, number>>({});
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedFunding, setSelectedFunding] = useState<string[]>([]);
  const [country, setCountry] = useState('');

  React.useEffect(() => {
    fetch((import.meta.env.VITE_API_URL || '') + '/api/opportunities/')
      .then(res => res.json())
      .then(data => {
        setOpportunities(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

    const token = localStorage.getItem('token');
    if (token) {
      fetch((import.meta.env.VITE_API_URL || '') + '/api/tracker/', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => res.ok ? res.json() : [])
        .then(data => {
          if (Array.isArray(data)) {
            const items: Record<number, number> = {};
            data.forEach((item: any) => {
              items[item.opportunity.id] = item.id;
            });
            setTrackerItems(items);
          }
        })
        .catch(console.error);
    }
  }, []);

  const handleToggleSave = async (oppId: number, trackerId: number | null) => {
    const token = localStorage.getItem('token');
    if (!token) return alert('Please login first');

    if (trackerId) {
      // Unsave
      const res = await fetch((import.meta.env.VITE_API_URL || '') + `/api/tracker/${trackerId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setTrackerItems(prev => {
          const next = { ...prev };
          delete next[oppId];
          return next;
        });
      }
    } else {
      // Save
      const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/tracker/', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunity_id: oppId, status: 'interested' })
      });
      if (res.ok) {
        const data = await res.json();
        setTrackerItems(prev => ({ ...prev, [oppId]: data.id }));
      } else {
        const data = await res.json();
        alert(data.detail || 'Failed to add to tracker');
      }
    }
  };

  const toggleType = (t: string) =>
    setSelectedTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const toggleFunding = (f: string) =>
    setSelectedFunding(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);

  const clearAll = () => { setSearch(''); setSelectedTypes([]); setSelectedFunding([]); setCountry(''); };
  const hasFilters = selectedTypes.length > 0 || selectedFunding.length > 0 || country;

  const filtered = opportunities.filter(opp => {
    if (search && !opp.title.toLowerCase().includes(search.toLowerCase()) &&
        !opp.organization.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedTypes.length > 0 && !selectedTypes.includes(opp.opportunity_type)) return false;
    if (selectedFunding.length > 0 && !selectedFunding.includes(opp.funding_type)) return false;
    if (country && !opp.country.toLowerCase().includes(country.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="bg-[#F8F7F4] min-h-[101vh] flex flex-col">
      <Navbar />

      {/* ── Page Header ── */}
      <div className="bg-[#1B5442] pt-[72px]">
        <div className="container-max py-10">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Discover Opportunities
          </h1>
          <p className="text-white/70 mb-6 max-w-xl">
            Browse {opportunities.length.toLocaleString()}+ curated opportunities from around the world.
          </p>

          {/* Search bar */}
          <div className="relative max-w-2xl">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, organization..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white border-0 text-sm shadow-lg outline-none focus:ring-2 focus:ring-white/40"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Body: Sidebar + Cards ── */}
      <main className="container-max py-8 flex-grow">
        <div className="flex gap-7 items-start w-full">

          {/* ── LEFT SIDEBAR FILTERS ── */}
          <aside className="hidden lg:block w-64 shrink-0 sticky top-24">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-[#1A1A2E]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Filters</h2>
                {hasFilters && (
                  <button onClick={clearAll} className="text-xs text-red-500 font-semibold hover:underline flex items-center gap-1">
                    <X size={11} /> Clear all
                  </button>
                )}
              </div>

              {/* Type */}
              <FilterSection title="Opportunity Type">
                <div className="flex flex-col gap-2">
                  {TYPES.map(t => (
                    <label key={t} className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(t)}
                        onChange={() => toggleType(t)}
                        className="w-4 h-4 rounded border-gray-300 accent-[#1B5442] cursor-pointer"
                      />
                      <span className={`text-sm transition-colors ${selectedTypes.includes(t) ? 'text-[#1B5442] font-semibold' : 'text-gray-600 group-hover:text-[#1B5442]'}`}>
                        {t}
                      </span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              {/* Funding */}
              <FilterSection title="Funding">
                <div className="flex flex-col gap-2">
                  {FUNDING_OPTIONS.map(f => (
                    <label key={f} className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedFunding.includes(f)}
                        onChange={() => toggleFunding(f)}
                        className="w-4 h-4 rounded border-gray-300 accent-[#1B5442] cursor-pointer"
                      />
                      <span className={`text-sm transition-colors ${selectedFunding.includes(f) ? 'text-[#1B5442] font-semibold' : 'text-gray-600 group-hover:text-[#1B5442]'}`}>
                        {f}
                      </span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              {/* Country */}
              <FilterSection title="Country / Region">
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="e.g. Germany, Remote..."
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                    className="input-field pl-8 text-sm py-2"
                  />
                </div>
              </FilterSection>

              {/* Active filter chips */}
              {hasFilters && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400 mb-2 font-medium">Active filters:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTypes.map(t => (
                      <button key={t} onClick={() => toggleType(t)}
                        className="flex items-center gap-1 px-2 py-1 bg-[#1B5442]/10 text-[#1B5442] text-xs rounded-md font-medium hover:bg-red-50 hover:text-red-500 transition-colors">
                        {t} <X size={10} />
                      </button>
                    ))}
                    {selectedFunding.map(f => (
                      <button key={f} onClick={() => toggleFunding(f)}
                        className="flex items-center gap-1 px-2 py-1 bg-[#1B5442]/10 text-[#1B5442] text-xs rounded-md font-medium hover:bg-red-50 hover:text-red-500 transition-colors">
                        {f} <X size={10} />
                      </button>
                    ))}
                    {country && (
                      <button onClick={() => setCountry('')}
                        className="flex items-center gap-1 px-2 py-1 bg-[#1B5442]/10 text-[#1B5442] text-xs rounded-md font-medium hover:bg-red-50 hover:text-red-500 transition-colors">
                        {country} <X size={10} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* ── RESULTS ── */}
          <div className="flex-1 min-w-0">
            {/* Results bar */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-[#1A1A2E]">{filtered.length}</span> opportunities found
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Sort:</span>
                <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white outline-none focus:ring-2 focus:ring-[#1B5442]/20 cursor-pointer">
                  <option>Newest First</option>
                  <option>Deadline Soonest</option>
                  <option>Most Relevant</option>
                </select>
              </div>
            </div>

            {/* Mobile filter chips row */}
            <div className="lg:hidden flex flex-wrap gap-2 mb-5">
              {TYPES.slice(0, 4).map(t => (
                <button
                  key={t}
                  onClick={() => toggleType(t)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    selectedTypes.includes(t) ? 'bg-[#1B5442] text-white' : 'bg-white border border-gray-200 text-gray-600'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Cards */}
            {loading ? (
              <div className="py-24 text-center w-full">
                <div className="animate-pulse-ring w-12 h-12 rounded-full bg-[#1B5442] opacity-50 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading opportunities...</p>
              </div>
            ) : filtered.length > 0 ? (
              <div className="flex flex-col gap-4 w-full">
                {filtered.map(opp => (
                  <OpportunityCard 
                    key={opp.id} 
                    opp={opp} 
                    isAdmin={isAdminOrOwner} 
                    trackerId={trackerItems[opp.id] || null}
                    onToggleSave={handleToggleSave}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-24 text-center w-full">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-xl font-bold mb-2 text-[#1A1A2E]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  No opportunities found
                </h3>
                <p className="text-gray-500 mb-6">Try adjusting your filters or search term.</p>
                <button onClick={clearAll} className="btn-primary">Clear all filters</button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ExplorePage;
