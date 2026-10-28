import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiLock, FiEye, FiEyeOff, FiBriefcase, FiAlertCircle, FiCheck, FiShield, FiInfo } from 'react-icons/fi';
import { toast } from 'react-toastify';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [legalModal, setLegalModal] = useState({ open: false, title: '', type: '' });

  const { register, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Calculate password strength
  useEffect(() => {
    let strength = 0;
    const { password } = formData;
    if (password.length >= 8) strength += 25;
    if (password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[0-9]/)) strength += 25;
    if (password.match(/[^A-Za-z0-9]/)) strength += 25;
    setPasswordStrength(strength);
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim() || !formData.rollNumber.trim() || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields (Full Name, User ID / Roll Number, and Password)');
      return false;
    }

    if (formData.rollNumber.trim().length < 3) {
      setError('User ID / Roll Number must be at least 3 characters');
      return false;
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const roleMapped = formData.role?.toUpperCase().startsWith('ROLE_') 
        ? formData.role.toUpperCase() 
        : `ROLE_${formData.role?.toUpperCase() || 'STUDENT'}`;
      
      const payload = {
        fullName: formData.name.trim(),
        rollNumber: formData.rollNumber.trim().toUpperCase(),
        password: formData.password,
        role: roleMapped
      };

      await register(payload);
      toast.success('Registration successful! Please sign in using your College User ID.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your details and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 25) return 'bg-red-500';
    if (passwordStrength <= 50) return 'bg-orange-500';
    if (passwordStrength <= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (passwordStrength <= 25) return 'Weak';
    if (passwordStrength <= 50) return 'Fair';
    if (passwordStrength <= 75) return 'Good';
    return 'Strong';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <Link to="/" className="inline-block text-3xl font-extrabold text-indigo-600">
            AlumniConnect
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Institutional Registration
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign in with your User ID
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-2xl sm:px-10 border border-gray-100">
          
          {/* Institutional Note */}
          <div className="mb-5 bg-indigo-50 border border-indigo-100 rounded-xl p-3.5 flex items-start gap-2.5">
            <FiInfo className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <p className="text-xs text-indigo-900 leading-relaxed">
              <strong>No email required to register.</strong> Sign up using your official College ID. You can add a personal recovery email later in your profile section.
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <div className="flex items-center">
                <FiAlertCircle className="text-red-500 mr-3 h-5 w-5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">I am registering as...</label>
              <div className="grid grid-cols-2 gap-4">
                <div 
                  onClick={() => handleChange({ target: { name: 'role', value: 'student' }})}
                  className={`cursor-pointer rounded-xl border-2 p-3.5 flex flex-col items-center justify-center transition-colors relative ${formData.role === 'student' ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-200 hover:border-indigo-300'}`}
                >
                  <FiUser className={`h-7 w-7 mb-1.5 ${formData.role === 'student' ? 'text-indigo-600' : 'text-gray-400'}`} />
                  <span className={`font-semibold text-sm ${formData.role === 'student' ? 'text-indigo-900' : 'text-gray-600'}`}>Current Student</span>
                  {formData.role === 'student' && <FiCheck className="absolute top-2 right-2 text-indigo-600" />}
                </div>
                
                <div 
                  onClick={() => handleChange({ target: { name: 'role', value: 'alumni' }})}
                  className={`cursor-pointer rounded-xl border-2 p-3.5 flex flex-col items-center justify-center transition-colors relative ${formData.role === 'alumni' ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-200 hover:border-indigo-300'}`}
                >
                  <FiBriefcase className={`h-7 w-7 mb-1.5 ${formData.role === 'alumni' ? 'text-indigo-600' : 'text-gray-400'}`} />
                  <span className={`font-semibold text-sm ${formData.role === 'alumni' ? 'text-indigo-900' : 'text-gray-600'}`}>College Alumni</span>
                  {formData.role === 'alumni' && <FiCheck className="absolute top-2 right-2 text-indigo-600" />}
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-2 border"
                  placeholder="e.g. Rahul Verma"
                />
              </div>
            </div>

            <div>
              <label htmlFor="rollNumber" className="block text-sm font-medium text-gray-700">
                College User ID / Roll Number <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiShield className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="rollNumber"
                  name="rollNumber"
                  type="text"
                  required
                  value={formData.rollNumber}
                  onChange={handleChange}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-2 border font-mono uppercase"
                  placeholder="e.g. 21CS101 or 18IT045"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Used to sign in to your institutional account.
              </p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-10 sm:text-sm border-gray-300 rounded-lg py-2 border"
                  placeholder="Minimum 8 characters"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              
              {/* Password strength indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500">Password strength:</span>
                    <span className={`text-xs font-semibold ${
                      passwordStrength <= 25 ? 'text-red-500' : 
                      passwordStrength <= 50 ? 'text-orange-500' : 
                      passwordStrength <= 75 ? 'text-yellow-500' : 'text-green-500'
                    }`}>{getStrengthText()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-300 ${getStrengthColor()}`} 
                      style={{ width: `${passwordStrength}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-10 sm:text-sm border-gray-300 rounded-lg py-2 border"
                  placeholder="Re-enter password"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    {showConfirmPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-500">
              By registering, you agree to our{' '}
              <button
                type="button"
                onClick={() => setLegalModal({ open: true, title: 'Terms of Service', type: 'terms' })}
                className="text-indigo-600 hover:underline bg-transparent border-0 cursor-pointer p-0 font-medium"
              >
                Terms of Service
              </button>{' '}
              and{' '}
              <button
                type="button"
                onClick={() => setLegalModal({ open: true, title: 'Privacy Policy', type: 'privacy' })}
                className="text-indigo-600 hover:underline bg-transparent border-0 cursor-pointer p-0 font-medium"
              >
                Privacy Policy
              </button>.
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  'Create Institutional Account'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Legal Modal */}
      {legalModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">{legalModal.title}</h3>
              <button
                onClick={() => setLegalModal({ open: false, title: '', type: '' })}
                className="text-gray-400 hover:text-gray-600 text-lg p-1"
              >
                ✕
              </button>
            </div>
            <div className="py-4 overflow-y-auto text-sm text-gray-600 space-y-3 leading-relaxed">
              {legalModal.type === 'terms' ? (
                <>
                  <p>Welcome to <strong>AlumniConnect</strong>. By creating an account or accessing any services, you agree to follow our code of conduct and community standards.</p>
                  <h4 className="font-semibold text-gray-900">1. Eligibility & Authenticity</h4>
                  <p>Only verified alumni, current students, and authorized faculty/administrators of the institution are permitted to register and interact.</p>
                  <h4 className="font-semibold text-gray-900">2. Professional Conduct</h4>
                  <p>All mentorship requests, referrals, and discussions must remain respectful, professional, and free of solicitation or harassment.</p>
                  <h4 className="font-semibold text-gray-900">3. Moderation & Termination</h4>
                  <p>Administrators reserve the right to suspend or remove any account that violates platform integrity, publishes deceptive job listings, or breaches university policies.</p>
                </>
              ) : (
                <>
                  <p>Your privacy is of the utmost importance to <strong>AlumniConnect</strong>.</p>
                  <h4 className="font-semibold text-gray-900">1. Information We Collect</h4>
                  <p>We collect names, roll numbers, academic departments, work history, and uploaded resumes to provide personalized mentorship matching and career referrals.</p>
                  <h4 className="font-semibold text-gray-900">2. How Data is Shared</h4>
                  <p>Your profile data is strictly visible to verified students and registered alumni within the platform network. We never sell or license personal data to third-party advertisers.</p>
                  <h4 className="font-semibold text-gray-900">3. Security & Control</h4>
                  <p>All passwords are encrypted using bcrypt hashing, and authenticated sessions are safeguarded by cryptographically signed JWT tokens.</p>
                </>
              )}
            </div>
            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setLegalModal({ open: false, title: '', type: '' })}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg transition-colors"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
