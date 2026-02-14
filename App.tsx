
import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TrustBar from './components/TrustBar';
import Stats from './components/Stats';
import Services from './components/Services';
import CodeMarketplace from './components/CodeMarketplace';
import CustomSoftware from './components/CustomSoftware';
import GameEngine from './components/GameEngine';
import Process from './components/Process';
import Industries from './components/Industries';
import ProjectShowcase from './components/ProjectShowcase';
import AppStore from './components/AppStore';
import TechStack from './components/TechStack';
import Security from './components/Security';
import Comparison from './components/Comparison';
import SchoolApp from './components/SchoolApp';
import Roadmap from './components/Roadmap';
import DevTools from './components/DevTools';
import SupportTiers from './components/SupportTiers';
import Testimonials from './components/Testimonials';
import Leadership from './components/Leadership';
import FAQ from './components/FAQ';
import ContactDrawer from './components/ContactDrawer';
import Footer from './components/Footer';

const App: React.FC = () => {
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
      <Navbar onOpenContact={() => setDrawerOpen(true)} />
      
      <main className="pt-[116px]">
        <Hero />
        <TrustBar />
        
        <section id="stats" className="py-24 bg-white border-b border-slate-50">
          <Stats />
        </section>

        {/* Quality Manifesto Section */}
        <section id="manifesto" className="py-40 bg-slate-50 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-20 opacity-[0.02] pointer-events-none">
            <h2 className="text-[300px] font-black leading-none">TRUST</h2>
          </div>
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl">
              <span className="text-blue-600 font-black uppercase tracking-[0.3em] text-xs">The Gothwad Manifesto</span>
              <h2 className="text-5xl md:text-8xl font-black mt-6 mb-12 text-slate-900 leading-[0.9] tracking-tighter">
                We Build Code That <br /> <span className="text-[#0056B3]">Never Sleeps.</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                <p className="text-slate-500 text-xl font-medium leading-relaxed">
                  Every product leaving the Gothwad factory is a testament to rigorous engineering. We don't settle for "good enough"—we push for industrial-grade stability that can handle millions of concurrent requests without a single millisecond of latency.
                </p>
                <div className="space-y-8">
                  <div className="border-l-4 border-[#0056B3] pl-6 py-2">
                    <h4 className="text-xl font-black text-slate-900 mb-2">Pvt. Ltd. Accountability</h4>
                    <p className="text-slate-500 text-sm">We are a registered corporate entity. Your investment is protected by law and professional ethics.</p>
                  </div>
                  <div className="border-l-4 border-slate-200 pl-6 py-2">
                    <h4 className="text-xl font-black text-slate-900 mb-2">Zero-Debt Engineering</h4>
                    <p className="text-slate-500 text-sm">We write clean, modular documentation that any developer can scale. No hidden spaghetti code.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="py-32 bg-white">
          <Services />
        </section>

        <section id="code-marketplace" className="py-40 bg-slate-50">
          <CodeMarketplace />
        </section>

        {/* Global Impact Grid */}
        <section id="impact" className="py-40 bg-white">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-1">
              <div className="bg-slate-900 p-20 text-white rounded-t-[60px] lg:rounded-tr-none lg:rounded-l-[60px] flex flex-col justify-between">
                <div>
                  <h3 className="text-5xl font-black mb-8 leading-none">Global <br /> Architecture.</h3>
                  <p className="text-slate-400 text-lg">Powering institutional growth across 15+ countries with proprietary G-Cloud nodes.</p>
                </div>
                <div className="mt-20">
                  <div className="text-6xl font-black text-blue-500">24/7</div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Uptime Reliability</p>
                </div>
              </div>
              <div className="bg-slate-50 p-1 lg:p-1 lg:col-span-2">
                <img 
                  src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop" 
                  alt="Global Network" 
                  className="w-full h-full object-cover rounded-b-[60px] lg:rounded-bl-none lg:rounded-r-[60px]"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="custom-software" className="py-32 bg-slate-50">
          <CustomSoftware />
        </section>

        <section id="game-engine" className="py-32 bg-white">
          <GameEngine />
        </section>

        <section id="process" className="py-32 bg-slate-50">
          <Process />
        </section>

        <section id="tech-matrix" className="py-32 bg-white">
          <TechStack />
        </section>

        <section id="industries" className="py-32 bg-slate-50">
          <Industries />
        </section>

        <section id="project-showcase" className="py-32 bg-white">
          <ProjectShowcase />
        </section>

        <section id="comparison" className="py-32 bg-slate-50">
          <Comparison />
        </section>

        <section id="app-store" className="py-40 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-24">
              <span className="text-blue-600 font-black uppercase tracking-[0.4em] text-xs">Official GTech Repository</span>
              <h2 className="text-5xl md:text-9xl font-black mt-4 text-slate-900 tracking-tighter uppercase leading-[0.85]">
                The <span className="text-[#0056B3]">Warehouse</span>
              </h2>
              <p className="text-slate-500 mt-10 max-w-2xl mx-auto text-xl font-medium leading-relaxed">
                Elite software architecture, full-source code bundles, and production-ready assets for the modern visionary.
              </p>
            </div>
            <AppStore />
          </div>
        </section>

        <section id="security" className="py-32 bg-slate-900 text-white">
          <Security />
        </section>

        <section id="school-x" className="py-32 bg-white">
          <SchoolApp />
        </section>

        <section id="timeline" className="py-32 bg-slate-50">
          <Roadmap />
        </section>

        <section id="studio" className="py-32 bg-white">
          <DevTools />
        </section>

        <section id="support-tiers" className="py-32 bg-slate-50">
          <SupportTiers />
        </section>

        <section id="testimonials" className="py-32 bg-white">
          <Testimonials />
        </section>

        <section id="leadership" className="py-32 bg-slate-50">
          <Leadership />
        </section>

        <section id="faq" className="py-32 bg-white">
          <FAQ />
        </section>
      </main>

      <Footer onOpenContact={() => setDrawerOpen(true)} />

      {/* Floating Action Button */}
      <button 
        onClick={() => setDrawerOpen(true)}
        className="fixed bottom-8 right-8 z-50 bg-[#0056B3] text-white p-6 rounded-full shadow-[0_20px_60px_rgba(0,86,179,0.5)] hover:scale-110 transition-transform active:scale-95 group"
      >
        <div className="space-y-1.5 flex flex-col items-center">
          <div className="w-6 h-0.5 bg-white rounded-full"></div>
          <div className="w-8 h-0.5 bg-white rounded-full"></div>
          <div className="w-4 h-0.5 bg-white rounded-full"></div>
        </div>
        <span className="absolute right-full mr-6 bg-slate-900 text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-2xl pointer-events-none">
          Open Command Center
        </span>
      </button>

      <ContactDrawer isOpen={isDrawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
};

export default App;
