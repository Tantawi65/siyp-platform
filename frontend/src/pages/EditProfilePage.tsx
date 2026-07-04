import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, GraduationCap, Save, ArrowLeft, Globe, Award, Plus, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../layouts/Navbar';
import { COUNTRIES } from '../utils/countries';
import { useAuth } from '../context/AuthContext';

interface ProfileFormData {
  name: string;
  country: string;
  university: string;
  bio: string;
  social_github: string;
  social_linkedin: string;
  social_instagram: string;
  privacy_level: string;
  avatar_url?: string;
}

const EditProfilePage: React.FC = () => {
  const { user } = useAuth();
  const isAdminOrOwner = user?.role === 'admin' || user?.role === 'owner';
  
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    country: '',
    university: '',
    bio: '',
    social_github: '',
    social_linkedin: '',
    social_instagram: '',
    privacy_level: 'public',
    avatar_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Programs logic
  const [availablePrograms, setAvailablePrograms] = useState<any[]>([]);
  const [acceptedPrograms, setAcceptedPrograms] = useState<any[]>([]);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [addingProgram, setAddingProgram] = useState(false);
  const [addAttempted, setAddAttempted] = useState(false);
  const [newProgram, setNewProgram] = useState({ name: '', organization: '', country: '', description: 'Added by user' });
  
  // Custom dropdown state
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const filteredPrograms = availablePrograms.filter(p => {
    if (selectedProgram === p.id.toString()) return true;
    return p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           p.organization.toLowerCase().includes(searchQuery.toLowerCase());
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/profiles/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setFormData({
            name: data.name || '',
            country: data.country || '',
            university: data.university || '',
            bio: data.bio || '',
            social_github: data.social_github || '',
            social_linkedin: data.social_linkedin || '',
            social_instagram: data.social_instagram || '',
            privacy_level: data.privacy_level || 'public',
            avatar_url: data.avatar_url || ''
          });
          setAcceptedPrograms(data.accepted_programs || []);
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchPrograms = async () => {
      try {
        const res = await fetch('/api/profiles/programs');
        if (res.ok) {
          setAvailablePrograms(await res.json());
        }
      } catch (err) {
        console.error('Failed to fetch programs', err);
      }
    };

    fetchProfile();
    fetchPrograms();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/profiles/me', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setMessage({ text: 'Profile updated successfully!', type: 'success' });
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        const error = await res.json();
        setMessage({ text: error.detail || 'Failed to update profile', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'An error occurred', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/profiles/me/avatar', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({ ...prev, avatar_url: data.avatar_url }));
        setMessage({ text: 'Profile picture updated!', type: 'success' });
      } else {
        const error = await res.json();
        setMessage({ text: error.detail || 'Failed to upload image', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'An error occurred during upload', type: 'error' });
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/profiles/me/avatar', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        setFormData(prev => ({ ...prev, avatar_url: '' }));
        setMessage({ text: 'Profile picture removed!', type: 'success' });
      } else {
        const error = await res.json();
        setMessage({ text: error.detail || 'Failed to remove image', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'An error occurred', type: 'error' });
    }
  };

  const handleAddProgram = async () => {
    if (!selectedProgram) return;

    if (selectedProgram === 'other' && (!newProgram.name || !newProgram.organization)) {
      setAddAttempted(true);
      return;
    }
    
    setAddingProgram(true);
    setAddAttempted(false);
    
    try {
      const token = localStorage.getItem('token');
      let programId = selectedProgram;
      
      if (selectedProgram === 'other') {
        const createRes = await fetch('/api/profiles/programs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(newProgram)
        });
        if (createRes.ok) {
          const created = await createRes.json();
          programId = created.id.toString();
          // Add to available programs so it appears next time
          setAvailablePrograms(prev => [...prev, created]);
        } else {
          throw new Error('Failed to submit new program to catalog.');
        }
      }

      const addRes = await fetch(`/api/profiles/me/programs/${programId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (addRes.ok) {
        const updatedProfile = await addRes.json();
        setAcceptedPrograms(updatedProfile.accepted_programs || []);
        setSelectedProgram('');
        setSearchQuery('');
        setNewProgram({ name: '', organization: '', country: '', description: 'Added by user' });
        setMessage({ text: 'Program added to your profile!', type: 'success' });
      } else {
        const error = await addRes.json();
        setMessage({ text: error.detail || 'Failed to add program', type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'An error occurred', type: 'error' });
    } finally {
      setAddingProgram(false);
    }
  };

  const handleRemoveProgram = async (programId: number) => {
    setMessage({ text: '', type: '' });
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/profiles/me/programs/${programId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const updatedProfile = await res.json();
        setAcceptedPrograms(updatedProfile.accepted_programs || []);
        setMessage({ text: 'Program removed from your profile.', type: 'success' });
      } else {
        const error = await res.json();
        setMessage({ text: error.detail || 'Failed to remove program', type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'An error occurred', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="bg-[#F8F7F4] min-h-screen flex flex-col items-center justify-center">
        <Navbar />
        <div className="animate-pulse-ring w-12 h-12 rounded-full bg-[#1B5442] opacity-50 mb-4 mt-20"></div>
        <p className="text-gray-500">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#F8F7F4] min-h-screen flex flex-col">
      <Navbar />
      
      <main className="container-max pt-28 pb-16 flex-grow">
        <div className="max-w-3xl mx-auto">
          <Link to="/dashboard" className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#1B5442] transition-colors mb-6 font-medium w-fit">
            <ArrowLeft size={15} /> Back to Dashboard
          </Link>
          
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <h1 className="text-2xl font-black text-[#1A1A2E] mb-6" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Edit Profile
            </h1>
            
            {message.text && (
              <div className={`mb-6 p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                {message.text}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              
              {/* Avatar Upload */}
              <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-100">
                <div className="relative group cursor-pointer w-24 h-24 rounded-full bg-[#1B5442] flex items-center justify-center shrink-0 border-4 border-white shadow-lg overflow-hidden">
                  {formData.avatar_url ? (
                    <img src={formData.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-black text-3xl">{formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}</span>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-semibold mt-1">Upload</span>
                  </div>
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="font-bold text-[#1A1A2E] text-lg" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Profile Picture</h3>
                  <p className="text-sm text-gray-500 mb-2">Upload a picture to personalize your profile.</p>
                  <div className="flex gap-4 items-center justify-center sm:justify-start">
                    <label className="text-sm font-semibold text-[#1B5442] hover:underline cursor-pointer">
                      Choose file...
                      <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                    </label>
                    {formData.avatar_url && (
                      <button type="button" onClick={handleRemoveAvatar} className="text-sm font-semibold text-red-500 hover:underline">
                        Remove photo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[#1A1A2E] mb-1.5">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Jane Doe" className="input-field pl-10" required />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-[#1A1A2E] mb-1.5">Country <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <select name="country" value={formData.country} onChange={handleChange} className="input-field pl-10 bg-white cursor-pointer" required>
                      <option value="" disabled>Select your country</option>
                      {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1A1A2E] mb-1.5">University / Organization <span className="text-red-500">*</span></label>
                <div className="relative">
                  <GraduationCap size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" name="university" value={formData.university} onChange={handleChange} placeholder="e.g. Oxford University" className="input-field pl-10" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1A1A2E] mb-1.5">Bio</label>
                <textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="Tell the community about your background and goals..." rows={4} className="input-field py-3 resize-y"></textarea>
              </div>

              <hr className="border-gray-100 my-2" />
              
              <h3 className="font-bold text-[#1A1A2E] text-lg" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Social Links</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5">Instagram URL</label>
                  <div className="relative">
                    <Globe size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#E1306C]" />
                    <input type="url" name="social_instagram" value={formData.social_instagram} onChange={handleChange} placeholder="https://instagram.com/..." className="input-field pl-9 text-sm py-2.5" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5">LinkedIn URL</label>
                  <div className="relative">
                    <Globe size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#0A66C2]" />
                    <input type="url" name="social_linkedin" value={formData.social_linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/..." className="input-field pl-9 text-sm py-2.5" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5">GitHub URL</label>
                  <div className="relative">
                    <Globe size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-800" />
                    <input type="url" name="social_github" value={formData.social_github} onChange={handleChange} placeholder="https://github.com/..." className="input-field pl-9 text-sm py-2.5" />
                  </div>
                </div>
              </div>

              <hr className="border-gray-100 my-2" />

              <div>
                <label className="block text-sm font-semibold text-[#1A1A2E] mb-1.5">Profile Privacy</label>
                <select name="privacy_level" value={formData.privacy_level} onChange={handleChange} className="input-field bg-white py-3 cursor-pointer">
                  <option value="public">Public (Visible in Community)</option>
                  <option value="private">Private (Hidden)</option>
                </select>
                <p className="text-xs text-gray-400 mt-2">Public profiles can be viewed by anyone and will appear in the Community page.</p>
              </div>

              <hr className="border-gray-100 my-2" />

              <div className="flex flex-col gap-4">
                <h3 className="font-bold text-[#1A1A2E] text-lg flex items-center gap-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  <Award size={18} className="text-[#1B5442]" /> Your Accepted Programs
                </h3>
                
                {acceptedPrograms.length > 0 ? (
                  <div className="flex flex-col gap-2 mb-2">
                    {acceptedPrograms.map((prog: any) => (
                      <div key={prog.id} className="flex items-center gap-3 px-4 py-3 bg-[#F8F7F4] rounded-xl border border-gray-100 group">
                        <Award size={16} className="text-[#1B5442] shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-[#1A1A2E] leading-tight truncate">{prog.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5 truncate">{prog.organization} {prog.country && `• ${prog.country}`}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveProgram(prog.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50"
                          title="Remove program"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No programs added yet.</p>
                )}

                <div className="bg-[#F8F7F4] p-5 rounded-2xl border border-gray-100 mt-2">
                  <h4 className="text-sm font-semibold text-[#1A1A2E] mb-3">Add a Program</h4>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-grow">
                      <input 
                        type="text" 
                        className="input-field w-full py-2.5 bg-white text-sm"
                        placeholder="Search for a program you were accepted to..."
                        value={searchQuery}
                        onFocus={() => setDropdownOpen(true)}
                        onBlur={() => setDropdownOpen(false)}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setDropdownOpen(true);
                          setSelectedProgram('');
                        }}
                      />
                      {dropdownOpen && (
                        <div className="absolute bottom-full mb-1 z-20 w-full bg-white border border-gray-100 rounded-xl shadow-lg max-h-64 overflow-y-auto flex flex-col">
                          <div className="flex-1 overflow-y-auto">
                            {filteredPrograms.length > 0 ? (
                              filteredPrograms.map(p => (
                                <button 
                                  key={p.id} 
                                  type="button"
                                  className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm border-b border-gray-50"
                                  onMouseDown={(e) => {
                                    e.preventDefault(); // Prevent onBlur from firing before click
                                    setSelectedProgram(p.id.toString());
                                    setSearchQuery(p.name);
                                    setDropdownOpen(false);
                                  }}
                                >
                                  {p.name} <span className="text-gray-400 text-xs ml-1">({p.organization})</span> {p.verified && <span className="text-green-500 ml-1">✓</span>}
                                </button>
                              ))
                            ) : (
                              <div className="px-4 py-3 text-sm text-gray-500 text-center">No programs found</div>
                            )}
                          </div>
                          <button 
                            type="button"
                            className="w-full text-left px-4 py-3 hover:bg-[#1B5442] hover:text-white text-sm font-medium text-[#1B5442] bg-[#A8D5C4]/10 transition-colors border-t border-gray-100 shrink-0 sticky bottom-0"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setSelectedProgram('other');
                              setSearchQuery('Other (Not in list)');
                              setDropdownOpen(false);
                            }}
                          >
                            + Add custom program (Not in list)
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {selectedProgram === 'other' && (
                    <div className="mt-4 flex flex-col gap-3 animate-fade-in-up">
                      <p className="text-xs text-gray-500">
                        {isAdminOrOwner 
                          ? "Admin Privilege: This program will be instantly verified and added to the global catalog." 
                          : "This will be submitted to the admins for verification, but added to your profile immediately."}
                      </p>
                      <input type="text" placeholder="Program Name *" className={`input-field py-2.5 text-sm bg-white ${addAttempted && !newProgram.name ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}`} value={newProgram.name} onChange={e => {setNewProgram({...newProgram, name: e.target.value}); setAddAttempted(false);}} />
                      <input type="text" placeholder="Organization *" className={`input-field py-2.5 text-sm bg-white ${addAttempted && !newProgram.organization ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}`} value={newProgram.organization} onChange={e => {setNewProgram({...newProgram, organization: e.target.value}); setAddAttempted(false);}} />
                      <input type="text" placeholder="Country (optional)" className="input-field py-2.5 text-sm bg-white" value={newProgram.country} onChange={e => setNewProgram({...newProgram, country: e.target.value})} />
                      {addAttempted && (!newProgram.name || !newProgram.organization) && (
                        <p className="text-xs text-red-500 font-medium -mt-1">* Program Name and Organization are required</p>
                      )}
                    </div>
                  )}

                  {selectedProgram && (
                    <button 
                      type="button" 
                      onClick={handleAddProgram} 
                      disabled={addingProgram}
                      className="mt-4 btn-secondary text-sm px-4 py-2 w-full sm:w-auto"
                    >
                      {addingProgram ? 'Adding...' : <><Plus size={14} /> Add to Profile</>}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-gray-100 mt-4">
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                  {saving ? 'Saving...' : <><Save size={16} /> Save Profile</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditProfilePage;
