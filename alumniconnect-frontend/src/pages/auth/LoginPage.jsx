import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Forgot Password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSending, setForgotSending] = useState(false);
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Load remembered credentials on mount
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem('rememberedEmail');
      const wasRemembered = localStorage.getItem('rememberMe') === 'true';
      if (savedEmail) {
        setFormData(prev => ({ ...prev, email: savedEmail }));
        setRememberMe(true);
      } else if (wasRemembered) {
        setRememberMe(true);
      }
    } catch (_) {}
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      if (user.role === 'ROLE_ADMIN' || user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'ROLE_ALUMNI' || user.role === 'alumni') navigate('/alumni/dashboard');
      else if (user.role === 'ROLE_STUDENT' || user.role === 'student') navigate('/student/dashboard');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setIsLoading(true);
      await login(formData);

      // Handle Remember Me persistence
      try {
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', formData.email.trim());
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('rememberedEmail');
          localStorage.removeItem('rememberMe');
        }
      } catch (_) {}

      toast.success('Logged in successfully!');
      // Redirection is handled by the useEffect above when context updates
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to log in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <Link to="/" className="inline-block text-3xl font-extrabold text-indigo-600">
            AlumniConnect
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              create a new account
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
          
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <div className="flex items-center">
                <FiAlertCircle className="text-red-500 mr-3 h-5 w-5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Roll Number / College ID / Email
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                  placeholder="e.g. 21CS101 or you@example.com"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Sign in using your constant College Roll Number or registered email.
              </p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                  placeholder="••••••••"
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
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 cursor-pointer select-none">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(formData.email || '');
                    setForgotSubmitted(false);
                    setIsForgotModalOpen(true);
                  }}
                  className="font-medium text-indigo-600 hover:text-indigo-500 bg-transparent border-0 cursor-pointer p-0"
                >
                  Forgot your password?
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Sign-In */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center mb-3">
              One-Click Demo Sign In (Roll Number / Email)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={async () => {
                  setFormData({ email: '21CS101', password: 'Password@123' });
                  setIsLoading(true);
                  try {
                    await login({ email: '21CS101', password: 'Password@123' });
                    toast.success('Signed in as Rahul Verma (21CS101)');
                  } catch (e) {
                    setError('Demo login failed');
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="py-2 px-2 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-xs font-semibold text-indigo-700 transition-colors text-center shadow-xs"
              >
                🎓 21CS101 (Student)
              </button>
              <button
                type="button"
                onClick={async () => {
                  setFormData({ email: '15CS042', password: 'Password@123' });
                  setIsLoading(true);
                  try {
                    await login({ email: '15CS042', password: 'Password@123' });
                    toast.success('Signed in as Arun (15CS042)');
                  } catch (e) {
                    setError('Demo login failed');
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="py-2 px-2 border border-purple-200 bg-purple-50 hover:bg-purple-100 rounded-lg text-xs font-semibold text-purple-700 transition-colors text-center shadow-xs"
              >
                💼 15CS042 (Arun)
              </button>
              <button
                type="button"
                onClick={async () => {
                  setFormData({ email: 'ADMIN01', password: 'Admin@123' });
                  setIsLoading(true);
                  try {
                    await login({ email: 'ADMIN01', password: 'Admin@123' });
                    toast.success('Signed in as System Administrator (ADMIN01)');
                  } catch (e) {
                    setError('Demo login failed');
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="py-2 px-2 border border-slate-300 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-800 transition-colors text-center shadow-xs"
              >
                🛡️ ADMIN01
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Reset Password</h3>
            <p className="text-sm text-gray-500 mb-4">
              Enter your registered email address to receive password recovery instructions.
            </p>

            {forgotSubmitted ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center my-4">
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2 font-bold text-lg">
                  ✓
                </div>
                <h4 className="font-semibold text-green-900 text-sm">Recovery Email Sent</h4>
                <p className="text-xs text-green-700 mt-1">
                  If an account exists for <span className="font-semibold">{forgotEmail}</span>, instructions have been sent.
                </p>
                <div className="mt-4 pt-3 border-t border-green-200/60 text-xs text-gray-500 text-left">
                  <p className="font-medium text-gray-700 mb-1">Demo Accounts Passwords:</p>
                  <p>• Student / Alumni: <code className="bg-white px-1.5 py-0.5 rounded border">Password@123</code></p>
                  <p>• Administrator: <code className="bg-white px-1.5 py-0.5 rounded border">Admin@123</code></p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(false)}
                  className="mt-4 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg transition-colors"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!forgotEmail.trim()) {
                    toast.error('Please enter your email');
                    return;
                  }
                  setForgotSending(true);
                  setTimeout(() => {
                    setForgotSending(false);
                    setForgotSubmitted(true);
                  }, 600);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotSending}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {forgotSending ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
