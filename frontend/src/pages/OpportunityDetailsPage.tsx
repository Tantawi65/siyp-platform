import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building2, MapPin, Clock, Globe, ExternalLink, Bookmark, Share2, ChevronLeft, Tag, Award, FileCheck, BookOpen } from 'lucide-react';
import Navbar from '../layouts/Navbar';
import Footer from '../layouts/Footer';
import { useAuth } from '../context/AuthContext';

interface Tag { id: number; name: string; }
interface Author { id: number; email: string; profile?: { name?: string }; }
interface Opportunity {
  id: number; title: string; organization: string; country: string;
  opportunity_type: string; funding_type: string; deadline: string;
  description: string; benefits: string; requirements: string;
  application_process: string; official_website: string; application_link: string;
  views: number; tags: Tag[]; author_id: number; author: Author;
}

const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm">
    <h2 className="flex items-center gap-2.5 text-xl font-bold text-[#1A1A2E] mb-5 pb-4 border-b border-gray-100" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      <span className="text-[#1B5442]">{icon}</span> {title}
    </h2>
    {children}
  </div>
);

const OpportunityDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth(); // Need to import useAuth!
  const isAdminOrOwner = user?.role === 'admin' || user?.role === 'owner';
  
  const [opp, setOpp] = React.useState<Opportunity | null>(null);
  const [loading, setLoading] = React.useState(true);

  const hasFetched = React.useRef(false);
  const [saving, setSaving] = React.useState(false);
  const [trackerId, setTrackerId] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    
    fetch(`/api/opportunities/${id}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setOpp(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/tracker/', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => res.ok ? res.json() : [])
        .then(data => {
          const savedItem = data.find((item: any) => item.opportunity.id === Number(id));
          if (savedItem) setTrackerId(savedItem.id);
        })
        .catch(console.error);
    }
  }, [id]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: opp?.title,
        url: window.location.href
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleSave = async () => {
    if (!opp) return;
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login first to save opportunities');
        return;
      }
      
      if (trackerId) {
        // Unsave
        const res = await fetch(`/api/tracker/${trackerId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setTrackerId(null);
      } else {
        // Save
        const res = await fetch('/api/tracker/', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ opportunity_id: opp.id, status: 'interested' })
        });
        if (res.ok) {
          const data = await res.json();
          setTrackerId(data.id);
        } else {
          const data = await res.json();
          alert(data.detail || 'Failed to add to tracker');
        }
      }
    } catch (e) {
      console.error(e);
      alert('Error saving opportunity');
    } finally {
      setSaving(false);
    }
  };

  const formattedDate = opp?.deadline 
    ? new Date(opp.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  if (loading) {
    return (
      <div className="bg-[#F8F7F4] min-h-screen flex flex-col items-center justify-center">
        <Navbar />
        <div className="animate-pulse-ring w-12 h-12 rounded-full bg-[#1B5442] opacity-50 mx-auto mb-4 mt-20"></div>
        <p className="text-gray-500">Loading opportunity details...</p>
      </div>
    );
  }

  if (!opp) {
    return (
      <div className="bg-[#F8F7F4] min-h-screen flex flex-col items-center justify-center">
        <Navbar />
        <div className="text-5xl mb-4 mt-20">🔍</div>
        <h3 className="text-xl font-bold mb-2">Opportunity not found</h3>
        <p className="text-gray-500">This opportunity might have been removed or doesn't exist.</p>
        <Link to="/explore" className="mt-4 text-[#1B5442] hover:underline">Back to Explore</Link>
      </div>
    );
  }

  return (
    <div className="bg-[#F8F7F4] min-h-screen flex flex-col">
      <Navbar />

      {/* Header */}
      <div className="bg-[#1B5442] pt-[72px]">
        <div className="container-max py-10">
          <Link to="/explore" className="flex items-center gap-2 text-white/60 hover:text-white text-sm font-medium mb-6 transition-colors">
            <ChevronLeft size={16} /> Back to Explore
          </Link>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="badge bg-[#E8A857] text-[#3D2800]">{opp.opportunity_type}</span>
                <span className="badge bg-white/20 text-white/90">{opp.funding_type}</span>
                <span className="badge bg-white/10 text-white/70">{opp.views} Views</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white mb-2 leading-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {opp.title}
              </h1>
              <p className="text-white/60 text-sm mb-4">
                Posted by SIYP Team &bull; Wrote by {opp.author?.profile?.name || (opp.author ? opp.author.email.split('@')[0] : 'Unknown')}
              </p>
              <div className="flex flex-wrap items-center gap-5 text-white/70 text-sm">
                <span className="flex items-center gap-1.5"><Building2 size={15} /> {opp.organization}</span>
                <span className="flex items-center gap-1.5"><MapPin size={15} /> {opp.country}</span>
                <span className="flex items-center gap-1.5 text-[#E8A857] font-medium"><Clock size={15} /> Deadline: {formattedDate}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 shrink-0">
              <a href={opp.application_link || opp.official_website || "#"} target="_blank" rel="noreferrer" className="btn-primary px-8 py-3.5 justify-center whitespace-nowrap">
                Apply Now <ExternalLink size={16} />
              </a>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={handleSave} disabled={saving} className={`flex items-center justify-center gap-1.5 py-2.5 border rounded-xl text-sm font-medium transition-all disabled:opacity-50 ${trackerId ? 'bg-white text-[#1B5442] border-white' : 'border-white/30 text-white/80 hover:bg-white/10'}`}>
                  <Bookmark size={14} className={trackerId ? 'fill-[#1B5442]' : ''} /> {saving ? 'Saving...' : (trackerId ? 'Saved' : 'Save')}
                </button>
                <button onClick={handleShare} className="flex items-center justify-center gap-1.5 py-2.5 border border-white/30 text-white/80 hover:bg-white/10 rounded-xl text-sm font-medium transition-all">
                  <Share2 size={14} /> Share
                </button>
              </div>
              {(isAdminOrOwner || user?.id === opp.author_id) && (
                <Link to={`/opportunities/${opp.id}/edit`} className="flex items-center justify-center gap-1.5 py-2 bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 rounded-xl text-sm font-medium transition-all">
                  Edit Opportunity
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <main className="container-max py-10 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-7">
          {/* Main content */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <Section icon={<BookOpen size={20} />} title="Description">
              <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">{opp.description}</p>
            </Section>

            <Section icon={<Award size={20} />} title="Benefits">
              <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">{opp.benefits}</p>
            </Section>

            <Section icon={<FileCheck size={20} />} title="Requirements & Eligibility">
              <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">{opp.requirements}</p>
              {(opp.official_website || opp.application_link) && (
                <a
                  href={opp.official_website || opp.application_link} target="_blank" rel="noreferrer"
                  className="mt-5 inline-flex items-center gap-2 text-[#1B5442] font-semibold hover:underline text-sm"
                >
                  <Globe size={15} /> Visit Official Website <ExternalLink size={13} />
                </a>
              )}
            </Section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-3 flex flex-col gap-5 min-w-[350px]">
            {/* Quick Info */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-[#1A1A2E] mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Quick Info</h3>
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Organization', value: opp.organization, icon: <Building2 size={14} /> },
                  { label: 'Country', value: opp.country, icon: <MapPin size={14} /> },
                  { label: 'Type', value: opp.opportunity_type, icon: <Award size={14} /> },
                  { label: 'Funding', value: opp.funding_type, icon: <FileCheck size={14} /> },
                  { label: 'Deadline', value: formattedDate, icon: <Clock size={14} />, highlight: true },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
                    <span className="text-gray-400 text-sm flex items-center gap-1.5">{item.icon} {item.label}</span>
                    <span className={`text-sm font-semibold text-right ${item.highlight ? 'text-red-500' : 'text-[#1A1A2E]'}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-[#1A1A2E] mb-4 flex items-center gap-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                <Tag size={16} className="text-[#1B5442]" /> Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {opp.tags?.map(tag => (
                  <span key={tag.id} className="px-3 py-1.5 bg-[#A8D5C4]/40 text-[#0F3329] text-sm rounded-lg font-medium">
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Apply CTA */}
            <a
              href={opp.application_link || opp.official_website || "#"} target="_blank" rel="noreferrer"
              className="btn-primary justify-center py-4 text-base"
            >
              Apply Now <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OpportunityDetailsPage;
