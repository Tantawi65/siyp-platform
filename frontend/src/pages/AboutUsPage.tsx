import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Globe, Heart, Shield, Zap, Award, BookOpen, Star,
  ArrowRight, CheckCircle, Target, Eye, Lightbulb
} from 'lucide-react';
import Navbar from '../layouts/Navbar';
import Footer from '../layouts/Footer';

/* ── Animated counter hook ── */
function useCountUp(target: number, duration = 1800, start = false) {
  const [count, setCount] = React.useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

/* ── Stat Item ── */
const StatItem: React.FC<{
  value: number; suffix?: string; label: string; color: string; start: boolean;
}> = ({ value, suffix = '', label, color, start }) => {
  const count = useCountUp(value, 2000, start);
  return (
    <div className="text-center">
      <div className={`text-5xl md:text-6xl font-black mb-2 ${color}`} style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-white/60 uppercase tracking-widest font-medium">{label}</div>
    </div>
  );
};

/* ── Value Card ── */
const ValueCard: React.FC<{ icon: React.ReactNode; title: string; desc: string; index: number }> = ({ icon, title, desc, index }) => (
  <div
    className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col gap-4"
    style={{ animationDelay: `${index * 100}ms` }}
  >
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1B5442] to-[#2A7A60] flex items-center justify-center text-white shadow-md">
      {icon}
    </div>
    <div>
      <h3 className="font-bold text-[#1A1A2E] text-lg mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </div>
  </div>
);

/* ── Offer Pill ── */
const OfferPill: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex items-center gap-2 bg-[#F0F9F5] border border-[#1B5442]/15 rounded-full px-4 py-2.5">
    <CheckCircle size={14} className="text-[#1B5442] shrink-0" />
    <span className="text-sm font-medium text-[#1A1A2E]">{label}</span>
  </div>
);

/* ── Timeline Step ── */
const TimelineItem: React.FC<{ icon: React.ReactNode; title: string; desc: string; last?: boolean }> = ({ icon, title, desc, last }) => (
  <div className="flex gap-5">
    <div className="flex flex-col items-center shrink-0">
      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#1B5442] to-[#2A7A60] flex items-center justify-center text-white shadow-md">
        {icon}
      </div>
      {!last && <div className="w-0.5 flex-1 bg-gradient-to-b from-[#1B5442]/40 to-transparent mt-2" />}
    </div>
    <div className={`pb-8 ${last ? '' : ''}`}>
      <h3 className="font-bold text-[#1A1A2E] text-base mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════ */
/*  Main Page                                                  */
/* ══════════════════════════════════════════════════════════ */
const AboutUsPage: React.FC = () => {
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = React.useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const values = [
    { icon: <Globe size={20} />, title: 'Accessibility', desc: 'Every student, regardless of background or location, deserves access to life-changing opportunities. We break down barriers so talent can shine.' },
    { icon: <Users size={20} />, title: 'Community', desc: 'Students grow faster when they help each other. SIYP is built around the belief that collaboration multiplies individual success.' },
    { icon: <Shield size={20} />, title: 'Integrity', desc: 'Every opportunity we share is carefully reviewed to ensure it\'s accurate, legitimate, and trustworthy. We take our responsibility seriously.' },
    { icon: <Lightbulb size={20} />, title: 'Empowerment', desc: 'Knowledge opens doors. We arm students with the information they need to make bold decisions and pursue global opportunities confidently.' },
    { icon: <Heart size={20} />, title: 'Collaboration', desc: 'Success is stronger when it\'s shared. We celebrate every acceptance and encourage members to pay it forward by contributing to the community.' },
    { icon: <Zap size={20} />, title: 'Excellence', desc: 'We hold ourselves to a high standard — in the opportunities we curate, the community we build, and the impact we create for students worldwide.' },
  ];

  const offers = [
    'Scholarships', 'Internships', 'Volunteering Opportunities', 'Exchange Programs',
    'Fellowships', 'Research Opportunities', 'Conferences', 'Competitions',
    'Summer Programs', 'Online Courses', 'Bootcamps', 'Career Development Resources',
  ];

  const communityFeatures = [
    { icon: <BookOpen size={16} />, text: 'Publish opportunities for community review' },
    { icon: <Users size={16} />, text: 'Build a public profile and showcase your achievements' },
    { icon: <Award size={16} />, text: 'Showcase accepted scholarships, internships, and programs' },
    { icon: <Globe size={16} />, text: 'Connect with students who share similar goals' },
    { icon: <Star size={16} />, text: 'Save and organize opportunities you plan to apply for' },
    { icon: <Heart size={16} />, text: 'Share knowledge and support future applicants' },
  ];

  return (
    <div className="bg-[#F8F7F4] min-h-screen flex flex-col">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative bg-[#1A1A2E] overflow-hidden pt-[72px]">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-[#1B5442]/30 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-[#2A7A60]/20 blur-3xl" />
          <div className="absolute inset-0 dot-grid opacity-5" />
        </div>

        <div className="container-max relative py-24 md:py-32">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 bg-[#1B5442]/40 border border-[#1B5442]/50 text-[#A8D5C4] text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
              <Heart size={12} />
              Youth-Led · Community-Driven
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              We exist to make
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#A8D5C4] to-[#4CAF50]">
                opportunity accessible
              </span>
              to everyone.
            </h1>
            <p className="text-white/70 text-lg leading-relaxed max-w-2xl mb-10">
              SIYP is a youth-led educational platform dedicated to helping students discover scholarships, internships, exchange programs, and more — all in one trusted, community-powered space.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/explore"
                className="inline-flex items-center gap-2 bg-[#1B5442] hover:bg-[#2A7A60] text-white font-semibold px-6 py-3.5 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-[#1B5442]/30"
              >
                Explore Opportunities <ArrowRight size={16} />
              </Link>
              <Link
                to="/community"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3.5 rounded-xl transition-all duration-200 border border-white/20"
              >
                <Users size={16} /> Join the Community
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll hint wave */}
        <div className="relative h-16 overflow-hidden">
          <svg viewBox="0 0 1440 64" className="absolute bottom-0 w-full" fill="#F8F7F4" preserveAspectRatio="none">
            <path d="M0,32 C240,64 480,0 720,32 C960,64 1200,0 1440,32 L1440,64 L0,64 Z" />
          </svg>
        </div>
      </section>

      {/* ── Impact Stats ── */}
      <section ref={statsRef} className="bg-gradient-to-br from-[#1B5442] to-[#0F2820] py-20">
        <div className="container-max">
          <p className="text-center text-white/50 text-sm uppercase tracking-widest mb-12 font-semibold">Our Impact So Far</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-6">
            <StatItem value={3300} suffix="+" label="Facebook Followers" color="text-white" start={statsVisible} />
            <StatItem value={100} suffix="K+" label="Content Views" color="text-[#A8D5C4]" start={statsVisible} />
            <StatItem value={4} label="Org Partnerships" color="text-white" start={statsVisible} />
            <StatItem value={4} label="Live Sessions" color="text-[#A8D5C4]" start={statsVisible} />
          </div>
        </div>
      </section>

      {/* ── Our Story ── */}
      <section className="py-24">
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: text */}
            <div>
              <span className="text-[#1B5442] text-sm font-bold uppercase tracking-widest mb-3 block">Our Story</span>
              <h2 className="text-3xl md:text-4xl font-black text-[#1A1A2E] mb-6 leading-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Born from a simple belief: talent should never be limited by access.
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Many students have the motivation and talent to succeed, but lack access to reliable information and guidance. SIYP was created to solve this exact problem — to make opportunities easier to discover and create a trusted space where students can learn from each other's experiences.
                </p>
                <p>
                  Unlike traditional opportunity websites, SIYP is built around the idea of <span className="font-semibold text-[#1A1A2E]">community</span>. Members don't just browse — they contribute, connect, share their journeys, and lift others up along the way.
                </p>
                <p>
                  Our long-term vision is to become the largest educational opportunities community in the Middle East and North Africa, where students can find opportunities, build meaningful connections, and learn from those who have successfully navigated the application process.
                </p>
              </div>
            </div>

            {/* Right: visual journey / timeline */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
              <h3 className="font-bold text-[#1A1A2E] text-xl mb-7" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>How SIYP Works</h3>
              <TimelineItem
                icon={<Globe size={18} />}
                title="Discover"
                desc="Browse thousands of curated scholarships, internships, exchange programs, and more — all verified by our team."
              />
              <TimelineItem
                icon={<Users size={18} />}
                title="Connect"
                desc="Build a profile, showcase your accepted programs, and connect with students who share your ambitions."
              />
              <TimelineItem
                icon={<BookOpen size={18} />}
                title="Contribute"
                desc="Share opportunities you've found, publish your own listings, and help the next student find their breakthrough."
              />
              <TimelineItem
                icon={<Award size={18} />}
                title="Succeed"
                desc="Apply confidently with community support, insider knowledge, and a network of like-minded students behind you."
                last
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Mission & Vision ── */}
      <section className="bg-[#1A1A2E] py-20">
        <div className="container-max">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Mission */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-10 hover:bg-white/8 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1B5442] to-[#2A7A60] flex items-center justify-center mb-6 shadow-lg">
                <Target size={24} className="text-white" />
              </div>
              <h2 className="text-2xl font-black text-white mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Our Mission</h2>
              <p className="text-white/70 leading-relaxed text-base">
                To empower young people by making educational and professional opportunities accessible to everyone, while fostering a collaborative community where knowledge, experiences, and opportunities are shared freely.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-gradient-to-br from-[#1B5442] to-[#2A7A60] rounded-3xl p-10 shadow-2xl shadow-[#1B5442]/40 relative overflow-hidden">
              <div className="absolute inset-0 dot-grid opacity-10" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
                  <Eye size={24} className="text-white" />
                </div>
                <h2 className="text-2xl font-black text-white mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Our Vision</h2>
                <p className="text-white/85 leading-relaxed text-base">
                  To become the leading opportunities and student community platform in the Middle East, connecting ambitious young people with global opportunities and with each other.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── What We Offer ── */}
      <section className="py-24">
        <div className="container-max">
          <div className="text-center mb-14">
            <span className="text-[#1B5442] text-sm font-bold uppercase tracking-widest mb-3 block">What We Offer</span>
            <h2 className="text-3xl md:text-4xl font-black text-[#1A1A2E]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              One platform. Every kind of opportunity.
            </h2>
            <p className="text-gray-500 mt-4 max-w-xl mx-auto text-base leading-relaxed">
              From scholarships and internships to bootcamps and conferences — if it helps students grow, you'll find it here.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center max-w-3xl mx-auto">
            {offers.map(o => <OfferPill key={o} label={o} />)}
          </div>
        </div>
      </section>

      {/* ── Core Values ── */}
      <section className="py-24 bg-[#F0F9F5]">
        <div className="container-max">
          <div className="text-center mb-14">
            <span className="text-[#1B5442] text-sm font-bold uppercase tracking-widest mb-3 block">What We Stand For</span>
            <h2 className="text-3xl md:text-4xl font-black text-[#1A1A2E]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Our Core Values
            </h2>
            <p className="text-gray-500 mt-4 max-w-lg mx-auto text-base leading-relaxed">
              These values guide every decision we make and every feature we build.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v, i) => <ValueCard key={v.title} {...v} index={i} />)}
          </div>
        </div>
      </section>

      {/* ── Community Features ── */}
      <section className="py-24">
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: visual */}
            <div className="bg-gradient-to-br from-[#1B5442] to-[#0F2820] rounded-3xl p-10 shadow-2xl relative overflow-hidden order-last lg:order-first">
              <div className="absolute inset-0 dot-grid opacity-10" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white/30">
                    <img src="/logo.jpg" alt="SIYP" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-white font-bold text-lg" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>SIYP Team</span>
                </div>
                <div className="space-y-4">
                  {communityFeatures.map((f, i) => (
                    <div key={i} className="flex items-start gap-3 bg-white/10 rounded-xl px-4 py-3.5 border border-white/10">
                      <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0 mt-0.5 text-white">
                        {f.icon}
                      </div>
                      <span className="text-white/85 text-sm font-medium leading-relaxed">{f.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: text */}
            <div>
              <span className="text-[#1B5442] text-sm font-bold uppercase tracking-widest mb-3 block">More Than a Directory</span>
              <h2 className="text-3xl md:text-4xl font-black text-[#1A1A2E] mb-6 leading-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                A community where students help students.
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6 text-base">
                SIYP isn't just a place to browse opportunities. It's a living, breathing community where every member can contribute, connect, and grow. When you join SIYP, you become part of something bigger than yourself.
              </p>
              <p className="text-gray-600 leading-relaxed mb-8 text-base">
                Share the opportunities you've discovered, showcase your own acceptances to inspire others, and connect with students who have walked the path you're aiming for.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-[#1B5442] hover:bg-[#2A7A60] text-white font-semibold px-6 py-3.5 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-[#1B5442]/30"
              >
                Join the Community <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="bg-gradient-to-r from-[#1B5442] via-[#2A7A60] to-[#1B5442] py-20 relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-10" />
        <div className="container-max relative text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-5" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Ready to find your next opportunity?
          </h2>
          <p className="text-white/75 text-lg mb-10 max-w-xl mx-auto">
            Join thousands of students already discovering scholarships, internships, and programs on SIYP.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-white text-[#1B5442] font-bold px-8 py-4 rounded-xl hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
            >
              Get Started — It's Free <ArrowRight size={16} />
            </Link>
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white font-semibold px-8 py-4 rounded-xl border border-white/25 transition-all duration-200"
            >
              <Globe size={16} /> Browse Opportunities
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutUsPage;
