import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Globe, Users, TrendingUp, Shield, BookOpen } from 'lucide-react';
import Navbar from '../layouts/Navbar';
import Footer from '../layouts/Footer';

// ---- Animated count-up hook ----
function useCountUp(target: number, duration = 2000, start = false) {
  const [count, setCount] = React.useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // cubic ease-out
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

// ---- Stat counter card ----
const StatCard: React.FC<{ target: number; suffix?: string; label: string; delay?: number; started: boolean }> = ({ target, suffix = '', label, delay = 0, started }) => {
  const count = useCountUp(target, 2000, started);
  return (
    <div className="text-center" style={{ transitionDelay: `${delay}ms` }}>
      <div className="text-4xl md:text-5xl font-black text-white mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm font-medium text-white/60 uppercase tracking-widest">{label}</div>
    </div>
  );
};

// ---- Feature Card ----
const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  desc: string;
  colSpan?: string;
  dark?: boolean;
}> = ({ icon, title, desc, colSpan = '', dark = false }) => (
  <div
    className={`rounded-2xl p-7 flex flex-col gap-4 card-hover border transition-all duration-200 ${colSpan} ${
      dark
        ? 'bg-[#1B5442] border-[#2A7A60] text-white'
        : 'bg-white border-gray-100 text-[#1A1A2E] shadow-sm'
    }`}
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${dark ? 'bg-white/15' : 'bg-[#1B5442]/10'}`}>
      <span className={dark ? 'text-white' : 'text-[#1B5442]'}>{icon}</span>
    </div>
    <div>
      <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{title}</h3>
      <p className={`text-sm leading-relaxed ${dark ? 'text-white/70' : 'text-gray-500'}`}>{desc}</p>
    </div>
  </div>
);

// ---- Step ----
const Step: React.FC<{ num: number; title: string; desc: string; active?: boolean }> = ({ num, title, desc, active }) => (
  <div className="flex flex-col items-center text-center gap-4">
    <div
      className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-lg shadow-lg z-10 ${
        active ? 'bg-[#1B5442] text-white ring-4 ring-[#1B5442]/20' : 'bg-white text-[#1B5442] border-2 border-[#1B5442]/30'
      }`}
      style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
    >
      {num}
    </div>
    <div>
      <h3 className="font-bold text-base mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{title}</h3>
      <p className="text-sm text-gray-500">{desc}</p>
    </div>
  </div>
);

// ---- Testimonial ----
const Testimonial: React.FC<{ quote: string; name: string; role: string; initials: string; color: string }> = ({
  quote, name, role, initials, color
}) => (
  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm card-hover flex flex-col gap-4">
    <div className="flex gap-1 mb-1">
      {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#E8A857" stroke="none" />)}
    </div>
    <p className="text-sm text-gray-600 leading-relaxed italic">"{quote}"</p>
    <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-50">
      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold ${color}`}>
        {initials}
      </div>
      <div>
        <div className="font-semibold text-sm text-[#1A1A2E]">{name}</div>
        <div className="text-xs text-gray-400">{role}</div>
      </div>
    </div>
  </div>
);

// ---- Stats Section with scroll-triggered animation ----
const StatsSection: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = React.useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-16 bg-[#F8F7F4]">
      <div className="container-max">
        <div
          ref={ref}
          className="bg-[#1B5442] rounded-3xl px-8 py-12 grid grid-cols-1 sm:grid-cols-3 gap-10 text-center divide-y sm:divide-y-0 sm:divide-x divide-white/10"
        >
          <StatCard target={100000} suffix="+" label="Views" delay={0} started={started} />
          <StatCard target={3300} suffix="+" label="Followers" delay={200} started={started} />
          <StatCard target={4} label="Live Sessions" delay={400} started={started} />
        </div>
      </div>
    </section>
  );
};

const LandingPage: React.FC = () => {
  return (
    <div className="bg-[#F8F7F4] text-[#1A1A2E] min-h-screen flex flex-col">
      <Navbar />

      {/* ============== HERO ============== */}
      <section
        className="relative flex items-center min-h-screen pt-[72px] overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0F3329 0%, #1B5442 45%, #2A7A60 75%, #0F3329 100%)', backgroundSize: '300% 300%', animation: 'gradientShift 10s ease infinite' }}
      >
        {/* Dot grid overlay */}
        <div className="absolute inset-0 dot-grid pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#2A7A60]/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#E8A857]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="container-max relative z-10 py-24 text-center">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 mb-8 animate-fade-in-up" style={{ opacity: 0 }}>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400"></span>
            </span>
            <span className="text-sm text-white/90 font-medium">The platform is live — join now</span>
          </div>

          {/* Headline */}
          <h1
            className="text-5xl md:text-7xl font-black text-white mb-6 leading-[1.05] tracking-tight animate-fade-in-up animate-delay-100 max-w-4xl mx-auto"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', opacity: 0 }}
          >
            Discover Opportunities.
            <br />
            <span className="text-[#E8A857]">Build Your Future.</span>
          </h1>

          {/* Sub */}
          <p
            className="text-lg md:text-xl text-white/75 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animate-delay-200"
            style={{ opacity: 0 }}
          >
            Join Our community for scholarships, fellowships, internships & conferences in the Middle East and beyond.
            Connect. Apply. Grow.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animate-delay-300" style={{ opacity: 0 }}>
            <Link to="/explore" className="btn-primary px-8 py-4 text-base shadow-2xl shadow-black/30">
              Explore Opportunities <ArrowRight size={18} />
            </Link>
            <Link
              to="/about"
              className="flex items-center gap-2 px-8 py-4 rounded-full border border-white/30 text-white bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all text-base font-semibold"
            >
              About Us
            </Link>
          </div>

          {/* Trust signal */}
          <div className="mt-10 flex items-center justify-center gap-2 text-white/50 text-sm animate-fade-in-up animate-delay-400" style={{ opacity: 0 }}>
            <Shield size={14} />
            Free to join · No spam · Cancel anytime
          </div>
        </div>

        {/* Curve divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-16">
            <path d="M0,80 C360,0 1080,80 1440,20 L1440,80 L0,80 Z" fill="#F8F7F4" />
          </svg>
        </div>
      </section>

      {/* ============== STATS ============== */}
      <StatsSection />

      {/* ============== FEATURES BENTO ============== */}
      <section id="features" className="section-pad bg-[#F8F7F4]">
        <div className="container-max">
          <div className="text-center mb-14">
            <span className="badge badge-primary mb-4">Platform Features</span>
            <h2 className="text-3xl md:text-4xl font-black text-[#1A1A2E] mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Everything you need to succeed
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Powerful tools designed to help you find, share, and track the best professional opportunities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-2">
              <FeatureCard
                icon={<Globe size={22} />}
                title="Discover"
                desc="Browse thousands of curated opportunities — scholarships, fellowships, internships, and conferences — filtered by country, funding type, and category."
                colSpan="h-full"
              />
            </div>
            <FeatureCard
              icon={<BookOpen size={22} />}
              title="Publish"
              desc="Submit opportunities and reach a highly engaged audience. All posts are reviewed by our team before going live."
            />
            <FeatureCard
              icon={<Users size={22} />}
              title="Connect"
              desc="Find and connect with peers, mentors, and accepted participants in programs worldwide."
            />
            <div className="md:col-span-2">
              <FeatureCard
                icon={<TrendingUp size={22} />}
                title="Track"
                desc="Manage your entire application pipeline with our Kanban-style tracker. Move cards from Interested → Preparing → Applied → Accepted."
                dark
                colSpan="h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============== HOW IT WORKS ============== */}
      <section className="section-pad bg-white">
        <div className="container-max">
          <div className="text-center mb-14">
            <span className="badge badge-primary mb-4">Simple Process</span>
            <h2 className="text-3xl md:text-4xl font-black text-[#1A1A2E] mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              How it works
            </h2>
            <p className="text-gray-500">Four simple steps to your next big opportunity.</p>
          </div>
          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="hidden md:block absolute top-7 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
            <Step num={1} title="Create Account" desc="Sign up free and set up your profile in minutes." active />
            <Step num={2} title="Explore" desc="Browse curated opportunities tailored to your goals." />
            <Step num={3} title="Apply" desc="Use our tracker to organise and submit applications." />
            <Step num={4} title="Get Accepted" desc="Land the role and take the next big step." active />
          </div>
        </div>
      </section>

      {/* ============== TESTIMONIALS ============== */}
      <section className="section-pad bg-[#F8F7F4]">
        <div className="container-max">
          <div className="text-center mb-14">
            <span className="badge badge-primary mb-4">Community Voices</span>
            <h2 className="text-3xl md:text-4xl font-black text-[#1A1A2E] mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Loved by thousands
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Testimonial
              quote="SIYP is doing an amazing job, and I enjoy following everything they share. I believe this community has a bright future, and I wouldn't be surprised to see SIYP launching its own international programs one day."
              name="Ahmed Yahia"
              role="Community Member"
              initials="AY"
              color="bg-[#1B5442]"
            />
            <Testimonial
              quote="I've been impressed by how much SIYP has grown over the years. Seeing the launch of the website was a pleasant surprise; it looks professional and offers something unique. It's clear that a lot of effort has gone into building this platform."
              name="Joseph Jamil"
              role="Content Creator"
              initials="JJ"
              color="bg-[#2A7A60]"
            />
            <Testimonial
              quote="I'm truly grateful to the SIYP Team for everything they do. Whenever I needed help or had a question, someone from the team was always there to support me. Thank you to everyone who contributes to SIYP!"
              name="NourEldeen"
              role="Community Member"
              initials="N"
              color="bg-[#E8A857]"
            />
          </div>
        </div>
      </section>

      {/* ============== CTA BANNER ============== */}
      <section className="section-pad bg-white">
        <div className="container-max">
          <div className="bg-[#1B5442] rounded-3xl px-8 md:px-16 py-14 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#E8A857]/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Ready to find your opportunity?
              </h2>
              <p className="text-white/70 mb-8 max-w-lg mx-auto">
                Join thousands of students and professionals who have already discovered their next big step.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/register" className="px-8 py-4 bg-white text-[#1B5442] font-bold rounded-full hover:bg-gray-100 transition-all shadow-xl text-base flex items-center gap-2">
                  Start for Free <ArrowRight size={18} />
                </Link>
                <Link to="/explore" className="px-8 py-4 border border-white/30 text-white font-semibold rounded-full hover:bg-white/10 transition-all text-base">
                  Browse Opportunities
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
