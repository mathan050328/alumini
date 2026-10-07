import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSend, FiPlus, FiMessageSquare, FiUser, FiChevronLeft } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { getConversations, getMessages, sendMessage } from '../../api/messageApi';
import { formatTimeAgo, formatDateTime } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const MessagesPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const messagesEndRef = useRef(null);

  const fetchConversations = async () => {
    try {
      setIsLoadingConversations(true);
      const res = await getConversations();
      const list = Array.isArray(res.data) ? res.data : (res.data?.content || []);
      setConversations(list);
    } catch (error) {
      toast.error('Failed to load conversations');
      setConversations([]);
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

  useEffect(() => {
    fetchConversations();
  }, []);

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
      const sentMsg = await sendMessage(conversationId, { content: newMessage.trim() });
      setMessages((prev) => [...prev, sentMsg]);
      setNewMessage('');
      scrollToBottom();
      
      // Update last message in conversation list
      setConversations(prev => prev.map(conv => {
        if (conv.id === conversationId || conv._id === conversationId) {
          return { ...conv, lastMessage: sentMsg.content, updatedAt: new Date().toISOString() };
        }
        return conv;
      }));
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const getOtherParticipant = (conversation) => {
    if (!conversation || !conversation.participants) return null;
    return conversation.participants.find(p => p.id !== user?.id && p._id !== user?.id);
  };

  const activeConversation = Array.isArray(conversations) ? conversations.find(c => String(c.id) === String(conversationId) || String(c._id) === String(conversationId)) : null;
  const otherParticipant = getOtherParticipant(activeConversation);

  // Mobile layout handling
  const showList = !conversationId;
  const showThread = !!conversationId;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-80px)] flex flex-col">
      <div className="flex flex-col md:flex-row h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Left Panel: Conversations List */}
        <div className={`md:w-1/3 border-r border-gray-200 flex flex-col ${showList ? 'block' : 'hidden md:flex'}`}>
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
            <button className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors">
              <FiPlus className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {isLoadingConversations ? (
              <div className="flex justify-center p-8"><LoadingSpinner /></div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FiMessageSquare className="w-8 h-8 mx-auto mb-3 text-gray-400" />
                <p>No conversations yet</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {conversations.map((conv) => {
                  const participant = getOtherParticipant(conv);
                  const isActive = conversationId === (conv.id || conv._id);
                  return (
                    <li key={conv.id || conv._id}>
                      <button
                        onClick={() => navigate(`/messages/${conv.id || conv._id}`)}
                        className={`w-full text-left p-4 hover:bg-gray-50 transition-colors flex items-center space-x-3 ${isActive ? 'bg-indigo-50 hover:bg-indigo-50' : ''}`}
                      >
                        <div className="flex-shrink-0">
                          {participant?.profilePicture ? (
                            <img src={participant.profilePicture} alt={participant?.name} className="w-12 h-12 rounded-full object-cover" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                              <FiUser className="w-6 h-6 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline">
                            <h3 className="text-sm font-medium text-gray-900 truncate">{participant?.name || 'Unknown User'}</h3>
                            <span className="text-xs text-gray-500 whitespace-nowrap">{formatTimeAgo(conv.updatedAt)}</span>
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
                    {otherParticipant?.profilePicture ? (
                      <img src={otherParticipant.profilePicture} alt={otherParticipant?.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <FiUser className="w-5 h-5 text-gray-500" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">{otherParticipant?.name || 'Chat'}</h2>
                    <p className="text-xs text-gray-500">{otherParticipant?.role || 'User'}</p>
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
                    const isMe = msg.senderId === user?.id || msg.sender === user?.id;
                    const msgDate = new Date(msg.createdAt);
                    
                    return (
                      <div key={msg.id || msg._id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm ${
                          isMe ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white text-gray-800 border border-gray-200 rounded-tl-sm'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                          <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                            {formatDateTime(msgDate.toISOString())}
                            {isMe && <span className="ml-1">{msg.read ? '✓✓' : '✓'}</span>}
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
                    className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled={isSending}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || isSending}
                    className="inline-flex items-center justify-center p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FiSend className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center flex-col text-gray-500">
              <FiMessageSquare className="w-16 h-16 mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Your Messages</h3>
              <p>Select a conversation or start a new one</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
