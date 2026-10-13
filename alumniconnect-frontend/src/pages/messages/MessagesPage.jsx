import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { FiSend, FiPlus, FiMessageSquare, FiUser, FiChevronLeft, FiX, FiSearch } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { getConversations, getMessages, sendMessage, startConversation } from '../../api/messageApi';
import { searchAlumni } from '../../api/alumniApi';
import api from '../../api/axiosConfig';
import { formatTimeAgo, formatDateTime } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const MessagesPage = () => {
  const { conversationId } = useParams();
  const [searchParams] = useSearchParams();
  const targetUserId = searchParams.get('userId') || searchParams.get('recipient');
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // New Chat Modal State
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [availableContacts, setAvailableContacts] = useState([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  
  const messagesEndRef = useRef(null);

  const fetchConversations = async () => {
    try {
      setIsLoadingConversations(true);
      const res = await getConversations();
      const list = Array.isArray(res.data) ? res.data : (res.data?.content || []);
      setConversations(list);
      return list;
    } catch (error) {
      toast.error('Failed to load conversations');
      setConversations([]);
      return [];
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const fetchMessages = async (id) => {
    try {
      setIsLoadingMessages(true);
      const res = await getMessages(id);
      const list = Array.isArray(res.data) ? res.data : (res.data?.content || []);
      setMessages(list);
      scrollToBottom();
    } catch (error) {
      toast.error('Failed to load messages');
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchConversations().then((existingList) => {
      // If navigated with ?userId=X, automatically start or select conversation
      if (targetUserId) {
        const found = existingList.find(c => String(c.otherUserId) === String(targetUserId));
        if (found) {
          navigate(`/messages/${found.id}`, { replace: true });
        } else {
          startConversation(Number(targetUserId))
            .then(res => {
              const newConvId = res.data?.conversationId || res.data?.id;
              if (newConvId) {
                fetchConversations();
                navigate(`/messages/${newConvId}`, { replace: true });
              }
            })
            .catch(() => {
              toast.error('Could not start conversation');
            });
        }
      }
    });
  }, [targetUserId]);

  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
    } else {
      setMessages([]);
    }
  }, [conversationId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId) return;

    try {
      setIsSending(true);
      const res = await sendMessage(conversationId, { content: newMessage.trim() });
      const sentMsg = res.data;
      setMessages((prev) => [...prev, sentMsg]);
      setNewMessage('');
      scrollToBottom();
      
      // Update last message in conversation list
      setConversations(prev => prev.map(conv => {
        if (String(conv.id) === String(conversationId)) {
          return { 
            ...conv, 
            lastMessage: sentMsg.content, 
            lastMessageAt: new Date().toISOString(),
            updatedAt: new Date().toISOString() 
          };
        }
        return conv;
      }));
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  // Handle open modal to start a new chat
  const handleOpenNewModal = async () => {
    setIsNewModalOpen(true);
    setContactSearchQuery('');
    try {
      setIsLoadingContacts(true);
      // Search alumni and students in parallel
      const [alumniRes, studentsRes] = await Promise.allSettled([
        searchAlumni({ page: 0, size: 50 }),
        api.get('/students/profile').catch(() => ({ data: null }))
      ]);
      
      let allContacts = [];
      
      if (alumniRes.status === 'fulfilled') {
        const alumniList = alumniRes.value?.data?.content || alumniRes.value?.data || [];
        allContacts = [...alumniList];
      }
      
      // Also try to get student users from search if available
      try {
        const studentSearchRes = await api.get('/alumni', { params: { page: 0, size: 100 } });
        const allFromAlumni = studentSearchRes.data?.content || studentSearchRes.data || [];
        // Merge, avoid duplicates
        const existingIds = new Set(allContacts.map(c => c.userId || c.id));
        allFromAlumni.forEach(u => {
          const uid = u.userId || u.id;
          if (!existingIds.has(uid)) {
            allContacts.push(u);
            existingIds.add(uid);
          }
        });
      } catch (_) {}
      
      // Filter out current user
      setAvailableContacts(allContacts.filter(c => (c.userId || c.id) !== user?.id));
    } catch (err) {
      toast.error('Failed to load contacts');
    } finally {
      setIsLoadingContacts(false);
    }
  };

  const handleSelectContact = async (contactUserId) => {
    try {
      setIsLoadingContacts(true);
      const targetId = Number(contactUserId);
      // If conversation already exists with this user, directly navigate
      const existingConv = conversations.find(c => Number(c.otherUserId) === targetId);
      if (existingConv) {
        setIsNewModalOpen(false);
        navigate(`/messages/${existingConv.id}`);
        return;
      }

      const res = await startConversation(targetId);
      const convId = res.data?.conversationId || res.data?.id;
      setIsNewModalOpen(false);
      await fetchConversations();
      if (convId) {
        navigate(`/messages/${convId}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not start conversation with this user');
    } finally {
      setIsLoadingContacts(false);
    }
  };

  const activeConversation = Array.isArray(conversations) 
    ? conversations.find(c => String(c.id) === String(conversationId)) 
    : null;

  const otherUserName = activeConversation?.otherUserName || activeConversation?.name || 'Chat';
  const otherUserImage = activeConversation?.otherUserProfilePictureUrl || activeConversation?.profilePicture;
  const otherUserRole = activeConversation?.otherUserRole || 'User';

  const filteredContacts = availableContacts.filter(c => {
    const q = contactSearchQuery.toLowerCase();
    const name = (c.fullName || c.name || '').toLowerCase();
    const company = (c.currentCompany || c.company || '').toLowerCase();
    const title = (c.jobTitle || '').toLowerCase();
    return name.includes(q) || company.includes(q) || title.includes(q);
  });

  // Mobile layout handling
  const showList = !conversationId;
  const showThread = !!conversationId;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-80px)] flex flex-col">
      <div className="flex flex-col md:flex-row h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden relative">
        
        {/* Left Panel: Conversations List */}
        <div className={`md:w-1/3 border-r border-gray-200 flex flex-col ${showList ? 'block' : 'hidden md:flex'}`}>
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
            <button 
              onClick={handleOpenNewModal}
              title="Start a new conversation"
              className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors shadow-sm"
            >
              <FiPlus className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {isLoadingConversations ? (
              <div className="flex justify-center p-8"><LoadingSpinner /></div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FiMessageSquare className="w-8 h-8 mx-auto mb-3 text-gray-400" />
                <p className="font-medium text-gray-700">No conversations yet</p>
                <p className="text-xs text-gray-400 mt-1">Click the + button above to start chatting with alumni.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {conversations.map((conv) => {
                  const isActive = String(conversationId) === String(conv.id);
                  const name = conv.otherUserName || conv.name || 'User';
                  const avatar = conv.otherUserProfilePictureUrl || conv.profilePicture;
                  const time = conv.lastMessageAt || conv.updatedAt || conv.createdAt;

                  return (
                    <li key={conv.id}>
                      <button
                        onClick={() => navigate(`/messages/${conv.id}`)}
                        className={`w-full text-left p-4 hover:bg-gray-50 transition-colors flex items-center space-x-3 ${isActive ? 'bg-indigo-50 hover:bg-indigo-50' : ''}`}
                      >
                        <div className="flex-shrink-0">
                          {avatar ? (
                            <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-lg">
                              {name.charAt(0) || <FiUser className="w-6 h-6 text-gray-500" />}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline">
                            <h3 className="text-sm font-medium text-gray-900 truncate">{name}</h3>
                            {time && (
                              <span className="text-xs text-gray-500 whitespace-nowrap">{formatTimeAgo(time)}</span>
                            )}
                          </div>
                          <p className={`text-sm truncate ${conv.unreadCount > 0 && !isActive ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                            {conv.lastMessage || 'Started a conversation'}
                          </p>
                        </div>
                        {conv.unreadCount > 0 && !isActive && (
                          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-indigo-600 rounded-full">
                            {conv.unreadCount}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Right Panel: Message Thread */}
        <div className={`md:w-2/3 flex flex-col h-full bg-gray-50 ${showThread ? 'flex' : 'hidden md:flex'}`}>
          {conversationId ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b border-gray-200 bg-white flex items-center shadow-sm">
                <button 
                  onClick={() => navigate('/messages')}
                  className="mr-3 md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                >
                  <FiChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-3">
                    {otherUserImage ? (
                      <img src={otherUserImage} alt={otherUserName} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                        {otherUserName.charAt(0) || <FiUser className="w-5 h-5 text-gray-500" />}
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">{otherUserName}</h2>
                    <p className="text-xs text-gray-500">{otherUserRole}</p>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoadingMessages ? (
                  <div className="flex justify-center p-8"><LoadingSpinner /></div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-500 p-8">Say hi to start the conversation!</div>
                ) : (
                  messages.map((msg, index) => {
                    const isMe = msg.senderId === user?.id || String(msg.senderId) === String(user?.id);
                    const timestamp = msg.sentAt || msg.createdAt;
                    
                    return (
                      <div key={msg.id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm ${
                          isMe ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white text-gray-800 border border-gray-200 rounded-tl-sm'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                          <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                            {timestamp ? formatDateTime(timestamp) : ''}
                            {isMe && <span className="ml-1">{msg.isRead ? '✓✓' : '✓'}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-gray-200">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    disabled={isSending}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || isSending}
                    className="inline-flex items-center justify-center p-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FiSend className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center flex-col text-gray-500 p-8 text-center">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                <FiMessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Your Messages</h3>
              <p className="text-sm text-gray-500 max-w-sm mb-4">
                Select an existing conversation from the left, or click the plus button to invite someone to chat.
              </p>
              <button 
                onClick={handleOpenNewModal}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
              >
                <FiPlus /> Start New Chat
              </button>
            </div>
          )}
        </div>
      </div>

      {/* New Conversation Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">New Conversation</h3>
              <button 
                onClick={() => setIsNewModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <FiSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={contactSearchQuery}
                  onChange={(e) => setContactSearchQuery(e.target.value)}
                  placeholder="Search by name, company, or title..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Contacts List */}
            <div className="flex-1 overflow-y-auto p-2">
              {isLoadingContacts ? (
                <div className="py-12 flex justify-center"><LoadingSpinner /></div>
              ) : filteredContacts.length === 0 ? (
                <div className="py-8 text-center text-gray-500 text-sm">
                  No contacts found matching "{contactSearchQuery}".
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredContacts.map(contact => {
                    const cName = contact.fullName || contact.name;
                    const cUserId = contact.userId || contact.id;

                    return (
                      <button
                        key={contact.id}
                        onClick={() => handleSelectContact(cUserId)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-indigo-50 transition-colors text-left group"
                      >
                        {contact.profilePictureUrl ? (
                          <img src={contact.profilePictureUrl} alt={cName} className="w-10 h-10 rounded-full object-cover border" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                            {cName?.charAt(0) || 'U'}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate group-hover:text-indigo-600">{cName}</p>
                          <p className="text-xs text-gray-500 truncate">
                            {contact.jobTitle ? `${contact.jobTitle}` : 'Alumni'} {contact.currentCompany ? `at ${contact.currentCompany}` : ''}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-3 bg-gray-50 border-t border-gray-100 text-right">
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
