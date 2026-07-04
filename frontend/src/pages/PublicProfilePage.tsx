import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, GraduationCap, Award, BookOpen } from 'lucide-react';
import Navbar from '../layouts/Navbar';
import Footer from '../layouts/Footer';

interface Program {
  id: number; name: string; organization: string; country: string;
}
interface PublishedOpportunity {
  id: number; title: string; organization: string; country: string; opportunity_type: string; status: string;
}
interface Profile {
  id: number; user_id: number; name: string; country: string;
  university: string; bio: string; accepted_programs: Program[];
  published_opportunities: PublishedOpportunity[];
  social_github?: string; social_linkedin?: string; social_instagram?: string;
  avatar_url?: string;
}

const PublicProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch((import.meta.env.VITE_API_URL || '') + `/api/profiles/${id}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setProfile(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="bg-[#F8F7F4] min-h-screen flex flex-col items-center justify-center">
        <Navbar />
        <div className="animate-pulse-ring w-12 h-12 rounded-full bg-[#1B5442] opacity-50 mb-4 mt-20"></div>
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-[#F8F7F4] min-h-screen flex flex-col items-center justify-center">
        <Navbar />
        <div className="text-5xl mb-4 mt-20">👤</div>
        <h3 className="text-xl font-bold mb-2">Profile not found</h3>
        <p className="text-gray-500">This profile might be private or doesn't exist.</p>
        <Link to="/community" className="mt-4 text-[#1B5442] hover:underline">Back to Community</Link>
      </div>
    );
  }

  return (
    <div className="bg-[#F8F7F4] min-h-screen flex flex-col">
      <Navbar />

      <div className="pt-[72px]">
        {/* Cover */}
        <div className="h-48 bg-[#1B5442] relative overflow-hidden">
          <div className="absolute inset-0 dot-grid opacity-20" />
          <div className="absolute top-6 right-12 w-48 h-48 bg-white/5 rounded-full" />
          <div className="absolute bottom-0 left-24 w-32 h-32 bg-[#E8A857]/10 rounded-full" />
        </div>
      </div>

      <main className="max-w-[1400px] mx-auto px-6 w-full -mt-14 pb-16 flex-grow relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          {/* Profile Sidebar */}
          <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-5">
            {/* Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm w-full">
              {/* Avatar */}
              <div className={`w-24 h-24 rounded-2xl bg-[#1B5442] text-white flex items-center justify-center text-4xl font-black mb-4 border-4 border-white shadow-md overflow-hidden`}
                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  profile.name ? profile.name.charAt(0).toUpperCase() : 'U'
                )}
              </div>

              <h1 className="text-2xl font-black text-[#1A1A2E] mb-1 break-words" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{profile.name || 'Anonymous User'}</h1>

              <div className="flex flex-col gap-2 mb-4">
                <div className="flex items-start gap-2 text-sm text-gray-500">
                  <MapPin size={14} className="shrink-0 mt-0.5" /> 
                  <span className="break-words flex-1 min-w-0">{profile.country || 'Location not specified'}</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-500">
                  <GraduationCap size={14} className="shrink-0 mt-0.5" /> 
                  <span className="break-words flex-1 min-w-0">{profile.university || 'University not specified'}</span>
                </div>
              </div>

              {profile.bio && <p className="text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4 mb-4 break-words">{profile.bio}</p>}

              {/* Social Icons using inline SVGs */}
              <div className="flex gap-2">
                {profile.social_instagram && (
                  <a href={profile.social_instagram} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-[#E1306C] hover:text-white transition-colors">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  </a>
                )}
                {profile.social_linkedin && (
                  <a href={profile.social_linkedin} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-[#0A66C2] hover:text-white transition-colors">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </a>
                )}
                {profile.social_github && (
                  <a href={profile.social_github} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-800 hover:text-white transition-colors">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                  </a>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-3xl font-black text-[#1B5442] mb-0.5" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{profile.accepted_programs?.length || 0}</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">Accepted</div>
              </div>
              <div>
                <div className="text-3xl font-black text-[#1B5442] mb-0.5" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{profile.published_opportunities?.length || 0}</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">Published</div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col gap-6 w-full min-w-0">
            {/* Accepted Programs */}
            <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-[#1A1A2E] mb-5 pb-4 border-b border-gray-100 flex items-center gap-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                <Award size={20} className="text-[#1B5442]" /> Accepted Programs
              </h2>
              {profile.accepted_programs?.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {profile.accepted_programs.map(prog => (
                    <div key={prog.id} className="flex items-center justify-between p-4 bg-[#F8F7F4] rounded-xl border border-gray-100 hover:border-[#1B5442]/20 transition-colors">
                      <div className="min-w-0 flex-1 pr-4">
                        <div className="font-semibold text-[#1A1A2E] text-sm break-words">{prog.name}</div>
                        <div className="text-xs text-gray-400 mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="break-words">{prog.organization}</span>
                          {prog.country && <span className="flex items-center gap-1 shrink-0"><MapPin size={10} /> {prog.country}</span>}
                        </div>
                      </div>
                      <div className="w-8 h-8 shrink-0 rounded-lg bg-[#A8D5C4]/50 flex items-center justify-center text-[#1B5442]">
                        <Award size={14} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No accepted programs yet.</p>
              )}
            </div>

            {/* Published Opportunities */}
            <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-[#1A1A2E] mb-5 pb-4 border-b border-gray-100 flex items-center gap-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                <BookOpen size={20} className="text-[#1B5442]" /> Published Opportunities
              </h2>
              {profile.published_opportunities?.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {profile.published_opportunities.map(opp => (
                    <div key={opp.id} className="flex items-center justify-between p-4 bg-[#F8F7F4] rounded-xl border border-gray-100 hover:border-[#1B5442]/20 transition-colors">
                      <div className="min-w-0 flex-1 pr-4">
                        <Link to={`/opportunities/${opp.id}`} className="font-semibold text-[#1B5442] text-sm break-words hover:underline block mb-1">{opp.title}</Link>
                        <div className="text-xs text-gray-400 mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="break-words">{opp.organization}</span>
                          {opp.country && <span className="flex items-center gap-1 shrink-0"><MapPin size={10} /> {opp.country}</span>}
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[10px] font-bold uppercase">{opp.opportunity_type}</span>
                        </div>
                      </div>
                      <div className="w-8 h-8 shrink-0 rounded-lg bg-[#A8D5C4]/50 flex items-center justify-center text-[#1B5442]">
                        <BookOpen size={14} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No published opportunities yet.</p>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PublicProfilePage;
