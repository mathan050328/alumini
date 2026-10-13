import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPosts, likePost, unlikePost } from '../../api/postApi';
import { useAuth } from '../../context/AuthContext';
import { POST_CATEGORIES, ROLES } from '../../utils/constants';
import { formatTimeAgo, truncateText } from '../../utils/formatters';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import { FiMessageSquare, FiHeart, FiEdit, FiUser } from 'react-icons/fi';

const CATEGORY_TABS = ['All', ...Object.keys(POST_CATEGORIES)];

const PostFeedPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const categoryFilter = activeCategory !== 'All' ? activeCategory : undefined;
      const res = await getPosts({ category: categoryFilter, page: Math.max(0, page - 1), size: 10 });
      const data = res.data || {};
      const list = Array.isArray(data) ? data : (data.content || data.posts || []);
      setPosts(list);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      toast.error('Failed to load posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, page]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleLikeToggle = async (e, postId, isLiked) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (isLiked) {
        await unlikePost(postId);
      } else {
        await likePost(postId);
      }
      setPosts(currentPosts => currentPosts.map(post => {
        if (post.id === postId) {
          const currentCount = post.likeCount ?? (post.likes?.length || 0);
          return {
            ...post,
            isLikedByCurrentUser: !isLiked,
            likeCount: isLiked ? Math.max(0, currentCount - 1) : currentCount + 1,
            likes: isLiked 
              ? (post.likes || []).filter(id => id !== user?.id)
              : [...(post.likes || []), user?.id]
          };
        }
        return post;
      }));
    } catch (error) {
      toast.error('Failed to update like status');
    }
  };

  const canWritePost = hasRole(ROLES.ALUMNI) || hasRole(ROLES.ADMIN) || user?.role?.includes('ALUMNI');

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Knowledge Hub</h1>
          <p className="text-gray-600 mt-1">Share and discover insights, tips, and experiences from alumni.</p>
        </div>
        {canWritePost && (
          <Link to="/posts/create" className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm">
            <FiEdit /> Write a Post
          </Link>
        )}
      </div>

      <div className="flex overflow-x-auto pb-4 mb-6 gap-2 hide-scrollbar">
        {CATEGORY_TABS.map(catKey => (
          <button
            key={catKey}
            onClick={() => { setActiveCategory(catKey); setPage(1); }}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === catKey 
                ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {catKey === 'All' ? 'All' : (POST_CATEGORIES[catKey] || catKey)}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : posts.length === 0 ? (
        <EmptyState 
          title="No posts found"
          message="No articles or discussions have been posted in this category yet." 
          icon={FiMessageSquare} 
        />
      ) : (
        <div className="space-y-6">
          {posts.map(post => {
            const postId = post.id;
            const isLiked = post.isLikedByCurrentUser ?? post.likes?.includes(user?.id);
            const authorName = post.alumniName || post.author?.name || 'Anonymous User';
            const authorImage = post.alumniProfilePictureUrl || post.author?.profileImage;
            const authorCompany = post.alumniCompany || post.author?.company || (post.alumniJobTitle ? post.alumniJobTitle : 'Alumni');
            
            return (
              <div 
                key={postId} 
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/posts/${postId}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {authorImage ? (
                      <img src={authorImage} alt={authorName} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                        <FiUser className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{authorName}</h3>
                      <p className="text-xs text-gray-500">
                        {authorCompany} • {formatTimeAgo(post.createdAt)}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">{POST_CATEGORIES[post.category] || post.category}</Badge>
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h2>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {truncateText(post.content, 200)}
                </p>

                <div className="flex items-center gap-6 pt-4 border-t border-gray-50">
                  <button 
                    onClick={(e) => handleLikeToggle(e, postId, isLiked)}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                      isLiked ? 'text-red-500 hover:text-red-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <FiHeart className={isLiked ? 'fill-current' : ''} />
                    <span>{post.likeCount ?? post.likes?.length ?? 0} Likes</span>
                  </button>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                    <FiMessageSquare />
                    <span>{post.commentCount ?? post.comments?.length ?? 0} Comments</span>
                  </div>
                </div>
              </div>
            );
          })}
          
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

export default PostFeedPage;
