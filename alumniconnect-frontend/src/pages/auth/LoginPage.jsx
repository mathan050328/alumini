import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiShield, FiKey, FiCheckCircle } from 'react-icons/fi';
import { resetPassword } from '../../api/authApi';
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
  const [forgotData, setForgotData] = useState({
    rollNumberOrEmail: '',
    email: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [forgotLoading, setForgotLoading] = useState(false);
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
      setError('Please enter both your User ID and password');
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
            Institutional Sign In
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500">
            Smart Alumni Networking & Mentorship Platform
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-gray-100">
          
          {/* Institutional Provisioning Notice Banner */}
          <div className="mb-6 p-4 rounded-xl bg-indigo-50/80 border border-indigo-100 flex items-start gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg shrink-0 mt-0.5">
              <FiShield className="w-4 h-4" />
            </div>
            <div className="text-xs text-indigo-950 leading-relaxed">
              <span className="font-semibold block text-indigo-900 mb-0.5">Institutional Access Only</span>
              Accounts are provisioned by your college administration. Please log in using your <strong>Roll Number / Registration ID</strong> and institutional password.
            </div>
          </div>
          
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
                User ID / Roll Number
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiShield className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border font-mono"
                  placeholder="e.g. 21CS101, 15CS042, or ADMIN01"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Sign in using the official User ID provided by your college administration.
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
                    setForgotData({
                      rollNumberOrEmail: formData.email || '',
                      email: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
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
              One-Click Demo Sign In (Admin-Issued User ID)
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

          <div className="mt-4 pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              New here?{' '}
              <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
                Register with your College ID
              </Link>
            </p>
          </div>

        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
                <FiKey className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Reset Password</h3>
                <p className="text-xs text-gray-500">Self-Service Institutional Verification</p>
              </div>
            </div>

            {forgotSubmitted ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center my-4">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-xl">
                  ✓
                </div>
                <h4 className="font-bold text-green-900 text-base">Password Reset Successfully!</h4>
                <p className="text-xs text-green-700 mt-2">
                  Your password has been updated. You can now sign in using your official User ID and your new password.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotModalOpen(false);
                    setForgotSubmitted(false);
                  }}
                  className="mt-5 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg transition-colors shadow-sm"
                >
                  Proceed to Sign In
                </button>
              </div>
            ) : (
              <>
                <p className="text-xs text-gray-600 mb-4 bg-indigo-50 border border-indigo-100 p-2.5 rounded-lg">
                  Enter the <strong>User ID</strong> provided by your college admin, and the <strong>recovery email</strong> saved in your profile section.
                </p>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!forgotData.rollNumberOrEmail.trim()) {
                      toast.error('Please enter your User ID / Roll Number');
                      return;
                    }
                    if (!forgotData.email.trim()) {
                      toast.error('Please enter your profile recovery email address');
                      return;
                    }
                    if (forgotData.newPassword.length < 6) {
                      toast.error('New password must be at least 6 characters');
                      return;
                    }
                    if (forgotData.newPassword !== forgotData.confirmPassword) {
                      toast.error('Passwords do not match');
                      return;
                    }

                    try {
                      setForgotLoading(true);
                      await resetPassword({
                        rollNumberOrEmail: forgotData.rollNumberOrEmail.trim(),
                        email: forgotData.email.trim(),
                        newPassword: forgotData.newPassword
                      });
                      setForgotSubmitted(true);
                      toast.success('Password updated successfully!');
                      setFormData(prev => ({ ...prev, email: forgotData.rollNumberOrEmail.trim(), password: '' }));
                    } catch (err) {
                      toast.error(err.response?.data?.message || 'Verification failed. Details do not match institutional records.');
                    } finally {
                      setForgotLoading(false);
                    }
                  }}
                  className="space-y-3.5"
                >
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      User ID / Roll Number (Provided by Admin)
                    </label>
                    <input
                      type="text"
                      required
                      value={forgotData.rollNumberOrEmail}
                      onChange={(e) => setForgotData(prev => ({ ...prev, rollNumberOrEmail: e.target.value }))}
                      placeholder="e.g. 21CS101, 15CS042, or ADMIN01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Profile Recovery Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={forgotData.email}
                      onChange={(e) => setForgotData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="e.g. rahul.verma@example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                    <p className="mt-1 text-[11px] text-gray-400">
                      Must match the recovery email saved in your profile section.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={forgotData.newPassword}
                      onChange={(e) => setForgotData(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Minimum 6 characters"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={forgotData.confirmPassword}
                      onChange={(e) => setForgotData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Re-enter new password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>

                  <div className="pt-2 border-t border-gray-100 text-[11px] text-gray-500 space-y-1">
                    <p className="font-semibold text-gray-700">Can't remember your registered email?</p>
                    <p>Contact the College Administration at <span className="font-mono text-indigo-600">admin@alumniconnect.com</span> to request an admin password reset.</p>
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
                      disabled={forgotLoading}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
                    >
                      {forgotLoading ? 'Verifying...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
