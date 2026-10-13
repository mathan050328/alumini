import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FiMail, FiPhone, FiMapPin, FiSend, FiMessageCircle, FiCheckCircle } from 'react-icons/fi';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please complete all required fields.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      toast.success('Your message has been received! We will be in touch shortly.');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 uppercase tracking-wider mb-3 inline-block">
            Support & Inquiries
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            Get in Touch With Us
          </h1>
          <p className="mt-3 text-gray-600 max-w-xl mx-auto">
            Have questions about alumni verification, mentorship requests, or need technical help? Reach out to our team.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Contact Details Card */}
          <div className="bg-gradient-to-br from-indigo-700 to-indigo-900 text-white rounded-2xl p-8 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold mb-6">Contact Information</h2>
              <div className="space-y-6 text-sm text-indigo-100">
                <div className="flex items-start gap-4">
                  <FiMail className="w-5 h-5 text-indigo-300 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Email</p>
                    <p>support@alumniconnect.com</p>
                    <p>relations@alumniconnect.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <FiPhone className="w-5 h-5 text-indigo-300 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Phone</p>
                    <p>+91 (080) 4567-8900</p>
                    <p>Mon - Fri, 9am - 6pm IST</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <FiMapPin className="w-5 h-5 text-indigo-300 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Campus Relations Office</p>
                    <p>Alumni Center, Academic Block 4</p>
                    <p>University Campus, Bangalore, India</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-indigo-600/50 text-xs text-indigo-200">
              <p className="flex items-center gap-2">
                <FiMessageCircle className="w-4 h-4" /> Average response time: Within 24 business hours.
              </p>
            </div>
          </div>

          {/* Contact Form Card */}
          <div className="md:col-span-2 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
            {submitted ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiCheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-6 text-sm leading-relaxed">
                  Thank you for reaching out, <span className="font-semibold text-gray-800">{formData.name}</span>. Our university relations team has received your inquiry and will contact you at <span className="font-semibold text-gray-800">{formData.email}</span>.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ name: '', email: '', subject: '', message: '' });
                    setSubmitted(false);
                  }}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-xs"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Rahul Verma"
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="you@university.edu"
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="e.g. Alumni Verification Inquiry / Technical Issue"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message *
                  </label>
                  <textarea
                    required
                    rows="5"
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Please describe your question or issue in detail..."
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-xs transition-colors disabled:opacity-50"
                  >
                    <FiSend className="mr-2" />
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
