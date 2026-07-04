import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, GraduationCap } from 'lucide-react';
import Navbar from '../layouts/Navbar';
import Footer from '../layouts/Footer';

interface Profile {
  id: number; user_id: number; name: string; country: string;
  university: string; accepted_programs: any[];
  published_opportunities?: any[];
  avatar_url?: string;
}

const MemberCard: React.FC<{ member: Profile }> = ({ member }) => {
  const color = 'bg-[#1B5442]'; // Default color
  return (
  <Link
    to={`/profile/${member.user_id}`}
    className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm card-hover flex flex-col min-w-[280px]"
  >
    {/* Card header */}
    <div className="h-20 bg-gradient-to-br from-[#1B5442] to-[#2A7A60] relative">
      <div className="absolute inset-0 dot-grid opacity-20" />
    </div>

    <div className="px-5 pb-5 flex flex-col flex-grow -mt-8 relative z-10">
      {/* Avatar */}
      <div className={`w-16 h-16 rounded-2xl ${color} flex items-center justify-center text-white text-2xl font-black border-4 border-white shadow-md mb-3 overflow-hidden`}
        style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        {member.avatar_url ? (
          <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" />
        ) : (
          member.name ? member.name.charAt(0).toUpperCase() : 'U'
        )}
      </div>

      <h3 className="font-bold text-[#1A1A2E] text-base mb-1 truncate" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{member.name || 'Anonymous User'}</h3>
      
      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5 truncate">
        <MapPin size={12} className="shrink-0" /> 
        <span className="truncate">{member.country || 'Location not specified'}</span>
      </div>
      
      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4 truncate">
        <GraduationCap size={12} className="shrink-0" /> 
        <span className="truncate">{member.university || 'University not specified'}</span>
      </div>

      {/* Stats */}
      <div className="mt-auto pt-4 border-t border-gray-100 grid grid-cols-2 gap-2 text-center">
        <div>
          <div className="text-xl font-black text-[#1B5442]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{member.accepted_programs?.length || 0}</div>
          <div className="text-xs text-gray-400">Accepted</div>
        </div>
        <div>
          <div className="text-xl font-black text-[#1B5442]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{member.published_opportunities?.length || 0}</div>
          <div className="text-xs text-gray-400">Published</div>
        </div>
      </div>
    </div>
  </Link>
)};

const CommunityPage: React.FC = () => {
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('');
  const [programFilter, setProgramFilter] = useState('');

  React.useEffect(() => {
    fetch((import.meta.env.VITE_API_URL || '') + '/api/profiles/community')
      .then(res => res.json())
      .then(data => {
        setMembers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filtered = members.filter(m => {
    if (search) {
      const s = search.toLowerCase();
      const matchesName = (m.name || '').toLowerCase().includes(s);
      const matchesProgram = (m.accepted_programs || []).some((p: any) => p.name.toLowerCase().includes(s) || p.organization.toLowerCase().includes(s));
      if (!matchesName && !matchesProgram) return false;
    }
    if (country && m.country !== country) return false;
    if (programFilter && !(m.accepted_programs || []).some((p: any) => p.id.toString() === programFilter)) return false;
    return true;
  });

  const countries = [...new Set(members.map(m => m.country).filter(Boolean))].sort();
  
  // Extract unique programs currently held by loaded members
  const uniquePrograms: any[] = [];
  const programIds = new Set();
  members.forEach(m => {
    (m.accepted_programs || []).forEach((p: any) => {
      if (!programIds.has(p.id)) {
        programIds.add(p.id);
        uniquePrograms.push(p);
      }
    });
  });
  uniquePrograms.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="bg-[#F8F7F4] min-h-screen flex flex-col">
      <Navbar />

      {/* Header */}
      <div className="bg-[#1B5442] pt-[72px]">
        <div className="container-max py-12">
          <span className="badge bg-white/20 text-white/90 mb-4">Community</span>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Community Directory
          </h1>
          <p className="text-white/70 mb-8 max-w-xl">
            Connect with {members.length.toLocaleString()} professionals, students, and accepted participants.
          </p>

          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-4xl">
            <div className="relative flex-1">
              <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or program..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white border-0 text-sm shadow-lg outline-none"
              />
            </div>
            <select
              value={country}
              onChange={e => setCountry(e.target.value)}
              className="py-3.5 px-4 rounded-xl bg-white border-0 text-sm shadow-lg outline-none w-full sm:w-auto min-w-[140px]"
            >
              <option value="">All Countries</option>
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={programFilter}
              onChange={e => setProgramFilter(e.target.value)}
              className="py-3.5 px-4 rounded-xl bg-white border-0 text-sm shadow-lg outline-none w-full sm:w-auto min-w-[180px] max-w-[250px] truncate"
            >
              <option value="">All Programs</option>
              {uniquePrograms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Body */}
      <main className="container-max py-10 flex-grow">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">
            Showing <span className="font-semibold text-[#1A1A2E]">{filtered.length}</span> members
          </p>
          <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white outline-none">
            <option>Most Accepted</option>
            <option>Most Active</option>
            <option>Newest Members</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-24">
            <div className="animate-pulse-ring w-12 h-12 rounded-full bg-[#1B5442] opacity-50 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading community members...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(m => <MemberCard key={m.id} member={m} />)}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-100 mt-5">
            <div className="text-5xl mb-4">👥</div>
            <h3 className="text-xl font-bold mb-2">No members found</h3>
            <p className="text-gray-500">Try adjusting your search.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CommunityPage;
