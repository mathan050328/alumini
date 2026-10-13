import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FiShield, FiFileText, FiArrowLeft } from 'react-icons/fi';

const LegalPage = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'privacy' ? 'privacy' : 'terms';
  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 mb-6">
          <FiArrowLeft className="mr-2" /> Back to Home
        </Link>

        {/* Tab Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('terms')}
              className={`flex-1 py-4 text-center font-semibold text-sm border-b-2 transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'terms'
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FiFileText /> Terms of Service
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`flex-1 py-4 text-center font-semibold text-sm border-b-2 transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'privacy'
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FiShield /> Privacy Policy
            </button>
          </div>

          <div className="p-8 text-gray-700 leading-relaxed space-y-6 text-sm">
            {activeTab === 'terms' ? (
              <>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Terms of Service</h2>
                  <p className="text-gray-500 text-xs">Last updated: October 2026</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">1. Acceptance of Terms</h3>
                  <p>
                    By registering for or using AlumniConnect, you agree to be bound by these Terms of Service. This platform is exclusively intended for current university students, verified alumni, and authorized administrative staff.
                  </p>

                  <h3 className="text-lg font-semibold text-gray-900">2. Professional Integrity</h3>
                  <p>
                    All users are expected to conduct themselves professionally. Mentorship requests, referral inquiries, discussions, and event participation must remain respectful and relevant to academic and career development. Unsolicited commercial advertising or spam is strictly prohibited.
                  </p>

                  <h3 className="text-lg font-semibold text-gray-900">3. Verification & Identity</h3>
                  <p>
                    Alumni profiles undergo administrator review. Providing false graduation years, misleading company affiliations, or fraudulent credentials will result in immediate permanent suspension.
                  </p>

                  <h3 className="text-lg font-semibold text-gray-900">4. Referrals and Job Postings</h3>
                  <p>
                    Alumni who post employment opportunities or offer referrals do so independently. AlumniConnect facilitates communication and application tracking, but does not guarantee employment or interview offers.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Privacy Policy</h2>
                  <p className="text-gray-500 text-xs">Last updated: October 2026</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">1. Information Collection</h3>
                  <p>
                    We collect essential profile information including names, academic departments, graduation years, job titles, companies, contact emails, and voluntary resume documents to deliver mentorship matching and employment workflows.
                  </p>

                  <h3 className="text-lg font-semibold text-gray-900">2. Data Usage & Confidentiality</h3>
                  <p>
                    Information uploaded to AlumniConnect is strictly accessible to verified campus network members. We never sell, lease, or monetize user data with third-party advertising brokers.
                  </p>

                  <h3 className="text-lg font-semibold text-gray-900">3. Security Infrastructure</h3>
                  <p>
                    All passwords are cryptographically salted and hashed using bcrypt. Sensitive requests require signed JSON Web Tokens (JWT). File uploads such as resumes and profile avatars are validated for size and type before storage.
                  </p>

                  <h3 className="text-lg font-semibold text-gray-900">4. User Rights</h3>
                  <p>
                    You retain the right to edit, update, or request deletion of your profile and data at any time via your account settings or by contacting university administration.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;
