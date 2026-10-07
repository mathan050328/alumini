import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheck, FiStar, FiBriefcase, FiCalendar, FiMessageSquare, FiSend, FiBell } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { getNotifications, markAsRead, markAllAsRead } from '../../api/notificationApi';
import { formatTimeAgo } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await getNotifications({ page, limit: 10 });
      const data = res.data || {};
      const list = Array.isArray(data) ? data : (data.content || data.notifications || []);
      setNotifications(list);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      toast.error('Failed to load notifications');
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  const handleMarkAsRead = async (id, link, e) => {
    if (e) e.stopPropagation();
    try {
      await markAsRead(id);
      setNotifications(prev => prev.map(n => 
        (n.id === id || n._id === id) ? { ...n, isRead: true } : n
      ));
      if (link) {
        navigate(link);
      }
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const getIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'mentorship': return <FiStar className="w-5 h-5 text-yellow-500" />;
      case 'job': return <FiBriefcase className="w-5 h-5 text-blue-500" />;
      case 'event': return <FiCalendar className="w-5 h-5 text-green-500" />;
      case 'message': return <FiMessageSquare className="w-5 h-5 text-indigo-500" />;
      case 'referral': return <FiSend className="w-5 h-5 text-purple-500" />;
      default: return <FiBell className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <button
          onClick={handleMarkAllAsRead}
          disabled={!notifications.some(n => !n.isRead)}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center"
        >
          <FiCheck className="mr-1 w-4 h-4" /> Mark all as read
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><LoadingSpinner /></div>
      ) : notifications.length === 0 ? (
        <EmptyState 
          icon={FiBell} 
          title="No notifications yet" 
          message="When you get updates, they'll show up here." 
        />
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {notifications.map((notification) => {
              const id = notification.id || notification._id;
              return (
                <li key={id}>
                  <div 
                    onClick={() => handleMarkAsRead(id, notification.link)}
                    className={`block hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${!notification.isRead ? 'border-l-4 border-indigo-500 bg-indigo-50/30' : 'border-l-4 border-transparent'}`}
                  >
                    <div className="px-4 py-4 sm:px-6 flex items-start">
                      <div className="flex-shrink-0 mt-1 mr-4 bg-white p-2 rounded-full shadow-sm border border-gray-100">
                        {getIcon(notification.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 mb-1">
                          {notification.title}
                        </div>
                        <p className="text-sm text-gray-500 mb-2">
                          {notification.message}
                        </p>
                        <div className="text-xs text-gray-400 flex items-center">
                          {formatTimeAgo(notification.createdAt)}
                        </div>
                      </div>
                      {!notification.isRead && (
                        <div className="flex-shrink-0 ml-2">
                          <button 
                            onClick={(e) => handleMarkAsRead(id, null, e)}
                            className="w-3 h-3 bg-indigo-600 rounded-full hover:bg-indigo-700 focus:outline-none"
                            title="Mark as read"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
