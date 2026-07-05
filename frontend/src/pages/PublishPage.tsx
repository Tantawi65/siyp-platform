import React, { useState } from 'react';
import Navbar from '../layouts/Navbar';
import Footer from '../layouts/Footer';
import { CalendarDays, Link as LinkIcon, AlignLeft, CheckSquare, Globe, Upload, MapPin, Building2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TYPES = ['Scholarship', 'Fellowship', 'Internship', 'Conference', 'Volunteer', 'Grant', 'Competition', 'Other'];
const FUNDING = ['Fully Funded', 'Partially Funded', 'Unpaid'];

const FormSection: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm">
    <h2 className="flex items-center gap-2.5 text-lg font-bold text-[#1A1A2E] mb-6 pb-4 border-b border-gray-100" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      <span className="text-[#1B5442]">{icon}</span> {title}
    </h2>
    <div className="flex flex-col gap-5">{children}</div>
  </div>
);

const Field: React.FC<{ label: string; required?: boolean; children: React.ReactNode; hint?: string }> = ({ label, required, children, hint }) => (
  <div>
    <label className="block text-sm font-semibold text-[#1A1A2E] mb-1.5">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    {children}
    {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
  </div>
);

const PublishPage: React.FC = () => {
  const { user } = useAuth();
  const isAdminOrOwner = user?.role === 'admin' || user?.role === 'owner';
  
  const [form, setForm] = useState({
    title: '', org: '', type: '', funding: '', deadline: '', country: '',
    description: '', benefits: '', requirements: '',
    officialUrl: '', applyUrl: '', tags: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isRolling, setIsRolling] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      
      // 1. Process tags
      const tagNames = form.tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
      let tag_ids: number[] = [];
      if (tagNames.length > 0) {
        // Fetch existing tags
        const tagsRes = await fetch('/api/opportunities/tags');
        const existingTags = tagsRes.ok ? await tagsRes.json() : [];
        
        for (const tName of tagNames) {
          const existing = existingTags.find((et: any) => et.name.toLowerCase() === tName.toLowerCase());
          if (existing) {
            tag_ids.push(existing.id);
          } else if (isAdminOrOwner) {
            // Create new tag if admin
            const createRes = await fetch('/api/opportunities/tags', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({ name: tName })
            });
            if (createRes.ok) {
              const newTag = await createRes.json();
              tag_ids.push(newTag.id);
            }
          }
        }
      }

      // 2. Submit opportunity
      const res = await fetch('/api/opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: form.title,
          organization: form.org,
          opportunity_type: form.type || null,
          funding_type: form.funding || null,
          deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
          country: form.country || null,
          description: form.description,
          benefits: form.benefits,
          requirements: form.requirements,
          official_website: form.officialUrl || null,
          application_link: form.applyUrl || null,
          category_id: 1, // Default to general category
          tag_ids: tag_ids
        })
      });

      if (res.ok) {
        setSuccess(true);
        setForm({
          title: '', org: '', type: '', funding: '', deadline: '', country: '',
          description: '', benefits: '', requirements: '',
          officialUrl: '', applyUrl: '', tags: '',
        });
        setIsRolling(false);
        setTimeout(() => setSuccess(false), 5000);
      } else {
        const error = await res.json();
        const errorMsg = Array.isArray(error.detail) 
          ? error.detail.map((d: any) => `${d.loc[d.loc.length-1]}: ${d.msg}`).join(', ') 
          : (error.detail || 'Unknown error');
        alert('Failed to publish: ' + errorMsg);
      }
    } catch (err) {
      console.error(err);
      alert('Network error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F8F7F4] min-h-screen flex flex-col">
      <Navbar />

      {/* Header */}
      <div className="bg-[#1B5442] pt-[72px]">
        <div className="container-max py-12">
          <span className="badge bg-white/20 text-white/90 mb-4">Publish</span>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Publish an Opportunity
          </h1>
          <p className="text-white/70 max-w-xl">
            {isAdminOrOwner 
              ? "Publish an opportunity directly to the platform. It will be live instantly."
              : "Share high-quality opportunities with our community. All submissions are reviewed by our team before publishing."}
          </p>
        </div>
      </div>

      <main className="container-max py-10 flex-grow max-w-3xl">
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-3">
            <ShieldCheck size={20} />
            <div className="font-medium">
              {isAdminOrOwner 
                ? "Success! Your opportunity has been published instantly." 
                : "Success! Your opportunity has been submitted for review."}
            </div>
          </div>
        )}
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>

          <FormSection icon={<Building2 size={18} />} title="Basic Details">
            <Field label="Opportunity Title" required>
              <input name="title" value={form.title} onChange={handleChange}
                placeholder="e.g. Software Engineering Internship 2027"
                className="input-field" required />
            </Field>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Organization / Company" required>
                <input name="org" value={form.org} onChange={handleChange}
                  placeholder="e.g. Google"
                  className="input-field" required />
              </Field>
              <Field label="Country / Region" required>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input name="country" value={form.country} onChange={handleChange}
                    placeholder="e.g. Germany, USA, Remote"
                    className="input-field pl-9" required />
                </div>
              </Field>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Field label="Type" required>
                <select name="type" value={form.type} onChange={handleChange} className="input-field" required>
                  <option value="">Select type</option>
                  {TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Funding">
                <select name="funding" value={form.funding} onChange={handleChange} className="input-field">
                  <option value="">Select funding</option>
                  {FUNDING.map(f => <option key={f}>{f}</option>)}
                </select>
              </Field>
              <Field label="Application Deadline" required={!isRolling}>
                <div className="flex flex-col gap-2.5 mt-1">
                  <div className="relative">
                    <CalendarDays size={15} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isRolling ? 'text-gray-300' : 'text-gray-400'}`} />
                    <input type="date" name="deadline" value={form.deadline} onChange={handleChange}
                      className="input-field pl-9 disabled:opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed" required={!isRolling} disabled={isRolling} />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer w-fit select-none font-medium">
                    <input type="checkbox" checked={isRolling} onChange={(e) => {
                      setIsRolling(e.target.checked);
                      if (e.target.checked) setForm(prev => ({...prev, deadline: ''}));
                    }} className="rounded text-[#1B5442] focus:ring-[#1B5442] w-4 h-4 cursor-pointer" />
                    Rolling Deadline (No fixed date)
                  </label>
                </div>
              </Field>
            </div>
          </FormSection>

          <FormSection icon={<AlignLeft size={18} />} title="Detailed Information">
            <Field label="Description" required hint="Describe the opportunity in detail. What is it? Who is it for?">
              <textarea name="description" value={form.description} onChange={handleChange}
                rows={5} placeholder="Describe the opportunity..."
                className="input-field resize-none" required />
            </Field>
            <Field label="Benefits" required hint="What will participants receive? Stipend, housing, certificate?">
              <textarea name="benefits" value={form.benefits} onChange={handleChange}
                rows={3} placeholder="e.g. $5,000 stipend, accommodation, mentorship..."
                className="input-field resize-none" required />
            </Field>
            <Field label="Requirements & Eligibility" required hint="Who can apply? What are the qualifications?">
              <textarea name="requirements" value={form.requirements} onChange={handleChange}
                rows={3} placeholder="e.g. Must be enrolled in university, 18+ years old..."
                className="input-field resize-none" required />
            </Field>
            <Field label="Tags" required hint="Comma-separated tags (e.g. Technology, Undergraduate, Women in STEM)">
              <input name="tags" value={form.tags} onChange={handleChange}
                placeholder="e.g. Science, Undergraduate, Remote"
                className="input-field" required />
            </Field>
          </FormSection>

          <FormSection icon={<LinkIcon size={18} />} title="Links">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Official Website">
                <div className="relative">
                  <Globe size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="url" name="officialUrl" value={form.officialUrl} onChange={handleChange}
                    placeholder="https://example.com"
                    className="input-field pl-9" />
                </div>
              </Field>
              <Field label="Direct Application Link" required>
                <div className="relative">
                  <LinkIcon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="url" name="applyUrl" value={form.applyUrl} onChange={handleChange}
                    placeholder="https://apply.example.com"
                    className="input-field pl-9" required />
                </div>
              </Field>
            </div>
          </FormSection>

          {/* Review Note */}
          {isAdminOrOwner ? (
            <div className="bg-[#A8D5C4]/30 border border-[#1B5442]/20 rounded-2xl p-5 flex items-start gap-3">
              <ShieldCheck size={18} className="text-[#1B5442] mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-[#1B5442] mb-1">Admin Privilege</p>
                <p className="text-sm text-[#1B5442]/70">
                  Because you are an administrator, this opportunity will bypass the review queue and be published instantly.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-[#A8D5C4]/30 border border-[#1B5442]/20 rounded-2xl p-5 flex items-start gap-3">
              <CheckSquare size={18} className="text-[#1B5442] mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-[#1B5442] mb-1">Reviewed before publishing</p>
                <p className="text-sm text-[#1B5442]/70">
                  Your submission will be reviewed by our team within 24–48 hours. You'll be notified once it's approved or if changes are needed.
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pb-4">
            <button type="button" className="btn-ghost px-6 py-3">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary px-8 py-3 gap-2 disabled:opacity-70">
              <Upload size={16} /> {submitting ? 'Processing...' : (isAdminOrOwner ? 'Publish Opportunity' : 'Submit for Review')}
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
};

export default PublishPage;
