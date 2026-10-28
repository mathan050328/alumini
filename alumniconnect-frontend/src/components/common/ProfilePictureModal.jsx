import React, { useState, useRef } from 'react';
import { FiCamera, FiUpload, FiLink, FiX, FiCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { uploadProfilePicture, setProfilePictureUrl } from '../../api/userApi';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProfilePictureModal = ({ isOpen, onClose, currentPictureUrl, onUpdated }) => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'url'
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(currentPictureUrl || user?.profilePictureUrl || '');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPG, PNG, or WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleUrlChange = (e) => {
    const val = e.target.value;
    setImageUrlInput(val);
    setPreviewUrl(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let newPhotoUrl = '';

      if (activeTab === 'upload') {
        if (!selectedFile) {
          toast.error('Please choose an image file first');
          setLoading(false);
          return;
        }
        const formData = new FormData();
        formData.append('file', selectedFile);
        const res = await uploadProfilePicture(formData);
        newPhotoUrl = res.data?.profilePictureUrl;
      } else {
        if (!imageUrlInput.trim()) {
          toast.error('Please enter an image URL');
          setLoading(false);
          return;
        }
        const res = await setProfilePictureUrl(imageUrlInput.trim());
        newPhotoUrl = res.data?.profilePictureUrl;
      }

      if (newPhotoUrl) {
        updateUser({ profilePictureUrl: newPhotoUrl });
        if (onUpdated) {
          onUpdated(newPhotoUrl);
        }
        toast.success('Profile picture updated successfully!');
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile picture');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <FiX className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <FiCamera className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Change Profile Picture</h3>
          <p className="text-xs text-gray-500 mt-1">
            Upload a photo from your computer or provide an image link
          </p>
        </div>

        {/* Live Preview */}
        <div className="flex justify-center mb-6">
          <div className="relative group">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Avatar Preview"
                className="w-28 h-28 rounded-full object-cover border-4 border-indigo-100 shadow-md bg-gray-50"
                onError={() => setPreviewUrl('')}
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-indigo-100 text-indigo-700 font-bold text-3xl flex items-center justify-center border-4 border-indigo-100 shadow-md">
                {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
            <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/30 text-white opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium pointer-events-none">
              Preview
            </div>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 pb-2 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'upload'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FiUpload className="w-4 h-4" />
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex-1 pb-2 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'url'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FiLink className="w-4 h-4" />
            Image URL
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'upload' ? (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 hover:border-indigo-400 rounded-xl p-5 text-center cursor-pointer bg-gray-50 hover:bg-indigo-50/20 transition-colors"
              >
                <FiUpload className="w-7 h-7 text-gray-400 mx-auto mb-2" />
                {selectedFile ? (
                  <div>
                    <p className="text-sm font-medium text-indigo-700">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Choose an image file</p>
                    <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, or WEBP up to 5MB</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                Direct Image Link
              </label>
              <input
                type="url"
                value={imageUrlInput}
                onChange={handleUrlChange}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">Paste any public web image address</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <LoadingSpinner size="small" />
              ) : (
                <>
                  <FiCheck className="w-4 h-4" />
                  Save Photo
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePictureModal;
