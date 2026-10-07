import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPostById, likePost, unlikePost, getComments, addComment, deleteComment } from '../../api/postApi';
import { useAuth } from '../../context/AuthContext';
import { formatTimeAgo, formatDate } from '../../utils/formatters';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import { FiHeart, FiMessageSquare, FiUser, FiTrash2, FiArrowLeft } from 'react-icons/fi';

const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        setLoading(true);
        const [postData, commentsData] = await Promise.all([
          getPostById(id),
          getComments(id).catch(() => []) 
        ]);
        setPost(postData);
        setComments(commentsData.length ? commentsData : (postData.comments || []));
      } catch (error) {
        toast.error('Failed to load post details');
      } finally {
        setLoading(false);
      }
    };
    fetchPostData();
  }, [id]);

  const handleLikeToggle = async () => {
    const isLiked = post.likes?.includes(user?.id);
    try {
      if (isLiked) {
        await unlikePost(id);
      } else {
        await likePost(id);
      }
      setPost(prev => ({
        ...prev,
        likes: isLiked 
          ? prev.likes.filter(uid => uid !== user.id)
          : [...(prev.likes || []), user.id]
      }));
    } catch (error) {
      toast.error('Failed to update like');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setSubmittingComment(true);
      const newComment = await addComment(id, { content: commentText });
      setComments(prev => [...prev, newComment]);
      setCommentText('');
      toast.success('Comment added');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    
    try {
      await deleteComment(id, commentId);
      setComments(prev => prev.filter(c => (c._id || c.id) !== commentId));
      toast.success('Comment deleted');
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!post) return <div className="text-center py-12 text-gray-500">Post not found.</div>;

  const author = post.author || {};
  const isLiked = post.likes?.includes(user?.id);

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <button 
        onClick={() => navigate('/posts')}
        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-6 font-medium"
      >
        <FiArrowLeft /> Back to Feed
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="p-8 border-b border-gray-100">
          <Badge variant="secondary" className="mb-4">{post.category}</Badge>
          <h1 className="text-3xl font-bold text-gray-900 mb-6">{post.title}</h1>
          
          <div className="flex items-center gap-4">
            {author.profileImage ? (
              <img src={author.profileImage} alt={author.name} className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                <FiUser className="w-6 h-6" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900">{author.name || 'Anonymous User'}</h3>
              <p className="text-sm text-gray-500">
                {author.company ? `${author.jobTitle || 'Alumni'} at ${author.company}` : 'Alumni'}
              </p>
              <p className="text-xs text-gray-400 mt-1">{formatDate(post.createdAt)}</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="prose max-w-none text-gray-800 whitespace-pre-wrap leading-relaxed">
            {post.content}
          </div>
        </div>

        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex items-center gap-6">
          <button 
            onClick={handleLikeToggle}
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
              isLiked ? 'text-red-500 hover:text-red-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FiHeart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            <span>{post.likes?.length || 0} Likes</span>
          </button>
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <FiMessageSquare className="w-5 h-5" />
            <span>{comments.length} Comments</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Comments</h3>

        <form onSubmit={handleAddComment} className="mb-8">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Share your thoughts..."
            rows="3"
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3 border mb-3 resize-none"
            required
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submittingComment || !commentText.trim()}
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {submittingComment ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>

        <div className="space-y-6">
          {comments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No comments yet. Be the first to share your thoughts!</p>
          ) : (
            comments.map(comment => {
              const commentAuthor = comment.author || {};
              const isOwnComment = commentAuthor._id === user?.id || commentAuthor.id === user?.id;
              
              return (
                <div key={comment._id || comment.id} className="flex gap-4">
                  {commentAuthor.profileImage ? (
                    <img src={commentAuthor.profileImage} alt={commentAuthor.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center shrink-0">
                      <FiUser />
                    </div>
                  )}
                  <div className="flex-1 bg-gray-50 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-semibold text-gray-900 text-sm">{commentAuthor.name || 'Anonymous User'}</span>
                        <span className="text-xs text-gray-500 ml-2">{formatTimeAgo(comment.createdAt)}</span>
                      </div>
                      {isOwnComment && (
                        <button 
                          onClick={() => handleDeleteComment(comment._id || comment.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete comment"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-gray-800 text-sm whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;
