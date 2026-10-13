import React from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiAward, FiBriefcase, FiTarget, FiHeart, FiShield, FiArrowRight } from 'react-icons/fi';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <section className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-700 text-white py-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 uppercase tracking-wider mb-4 inline-block">
            About AlumniConnect
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            Bridging Generations of Students and Graduates
          </h1>
          <p className="text-lg md:text-xl text-indigo-100 max-w-2xl mx-auto leading-relaxed">
            We are dedicated to building a lifelong ecosystem where experienced alumni empower students through mentorship, exclusive referrals, and career acceleration.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
              <FiTarget className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              To eliminate career uncertainty for university students by connecting them directly with accomplished alumni working in top organizations worldwide. We believe in mentorship without barriers.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
              <FiHeart className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Our Values</h2>
            <p className="text-gray-600 leading-relaxed">
              Integrity, community empowerment, giving back to the alma mater, and transparent collaboration. Every interaction on our platform is designed to produce tangible career growth.
            </p>
          </div>
        </div>

        {/* Core Pillars */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Platform Pillars</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs text-center">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FiUsers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Verified Network</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Every alumni profile is vetted for authenticity before granting full platform privileges.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs text-center">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FiAward className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">1-on-1 Mentorship</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Students request dedicated mentors based on technology stack, career goals, and companies.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs text-center">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FiBriefcase className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Verified Referrals</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Job postings direct from internal alumni with streamlined employee referral workflows.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs text-center">
              <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FiShield className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Privacy & Security</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Enterprise-grade JWT authorization and secure data boundaries protecting university members.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white text-center shadow-lg">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Join the Network?</h2>
          <p className="text-indigo-100 mb-6 max-w-xl mx-auto text-sm md:text-base">
            Whether you are a student preparing for your first role or an alumnus eager to mentor the next generation, your journey starts here.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center px-6 py-3 bg-white text-indigo-700 font-semibold rounded-lg hover:bg-indigo-50 transition-colors shadow-sm text-sm"
            >
              Get Started <FiArrowRight className="ml-2" />
            </Link>
            <Link
              to="/alumni-directory"
              className="inline-flex items-center px-6 py-3 bg-indigo-700/60 border border-white/30 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors text-sm"
            >
              Browse Directory
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
