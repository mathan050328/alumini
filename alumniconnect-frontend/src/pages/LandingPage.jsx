import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUsers, FiBriefcase, FiCalendar, FiArrowRight } from 'react-icons/fi';

const LandingPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'ROLE_ADMIN' || user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'ROLE_ALUMNI' || user.role === 'alumni') navigate('/alumni/dashboard');
      else if (user.role === 'ROLE_STUDENT' || user.role === 'student') navigate('/student/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 animate-fade-in-up">
              Connect. Mentor. <span className="text-indigo-300">Grow.</span>
            </h1>
            <p className="text-xl md:text-2xl text-indigo-100 mb-10 leading-relaxed">
              The ultimate platform bridging the gap between students and alumni. Discover mentorship, find jobs, and build a network that lasts a lifetime.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/login" className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-full text-indigo-900 bg-white hover:bg-indigo-50 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Access Institutional Portal <FiArrowRight className="ml-2" />
              </Link>
            </div>
          </div>
        </div>
        
        {/* Curved bottom edge */}
        <div className="absolute bottom-0 w-full overflow-hidden leading-none transform translate-y-1">
          <svg className="relative block w-full h-12 md:h-24" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118,130.9,132.2,201.2,126.9,242.4,123.7,282.8,112.5,321.39,56.44Z" className="fill-slate-50"></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything you need to succeed</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Our platform provides comprehensive tools designed specifically to help students and alumni connect effectively.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="w-14 h-14 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6">
                <FiUsers className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Mentorship Matching</h3>
              <p className="text-gray-600 leading-relaxed">Find the perfect mentor based on industry, skills, and goals. Connect with experienced alumni who can guide your career path.</p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="w-14 h-14 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6">
                <FiBriefcase className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Job & Referral Board</h3>
              <p className="text-gray-600 leading-relaxed">Access exclusive job postings and request referrals directly from alumni working at your dream companies.</p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="w-14 h-14 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-6">
                <FiCalendar className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Events & Networking</h3>
              <p className="text-gray-600 leading-relaxed">Attend exclusive webinars, mock interviews, and networking sessions hosted by successful industry professionals.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-indigo-300 mb-2">500+</div>
              <div className="text-indigo-100 font-medium">Alumni</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-indigo-300 mb-2">2000+</div>
              <div className="text-indigo-100 font-medium">Students</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-indigo-300 mb-2">100+</div>
              <div className="text-indigo-100 font-medium">Companies</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-indigo-300 mb-2">300+</div>
              <div className="text-indigo-100 font-medium">Jobs Posted</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Get started in three simple steps.</p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-center items-center gap-12 relative">
            <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-1 bg-indigo-100 -z-10 -translate-y-1/2"></div>
            
            <div className="flex flex-col items-center text-center max-w-xs relative z-10 bg-white px-4">
              <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold mb-4 shadow-lg border-4 border-white">1</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Create Profile</h3>
              <p className="text-gray-600">Sign up and fill out your profile with your skills, interests, and goals.</p>
            </div>
            
            <div className="flex flex-col items-center text-center max-w-xs relative z-10 bg-white px-4">
              <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold mb-4 shadow-lg border-4 border-white">2</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Find Alumni</h3>
              <p className="text-gray-600">Search our directory to find alumni in your desired field or company.</p>
            </div>
            
            <div className="flex flex-col items-center text-center max-w-xs relative z-10 bg-white px-4">
              <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold mb-4 shadow-lg border-4 border-white">3</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Start Networking</h3>
              <p className="text-gray-600">Request mentorship, apply for jobs, or ask for referrals directly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Success Stories</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-xl">
                  SJ
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Sarah Jenkins</h4>
                  <p className="text-sm text-gray-500">Software Engineer @ Google</p>
                </div>
              </div>
              <p className="text-gray-700 italic">"I found my mentor through AlumniConnect during my junior year. Her guidance was instrumental in helping me prepare for my interviews and land my dream job."</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-xl">
                  MR
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Michael Ross</h4>
                  <p className="text-sm text-gray-500">Alumnus, Class of 2018</p>
                </div>
              </div>
              <p className="text-gray-700 italic">"Giving back to my alma mater has never been easier. I've mentored three students so far, and seeing them grow and succeed is incredibly rewarding."</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-xl">
                  AK
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Anita Kumar</h4>
                  <p className="text-sm text-gray-500">Product Manager @ Microsoft</p>
                </div>
              </div>
              <p className="text-gray-700 italic">"The referral request system is brilliant. It streamlines the whole process, making it easy for me to refer talented students from my university to open roles."</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-indigo-600 py-16 text-center text-white">
        <h2 className="text-3xl font-bold mb-6">Ready to accelerate your career?</h2>
        <Link to="/login" className="inline-block px-8 py-4 text-lg font-medium rounded-full text-indigo-600 bg-white hover:bg-gray-100 transition-colors shadow-lg">
          Access Institutional Portal
        </Link>
      </section>
    </div>
  );
};

export default LandingPage;
