import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPostById, likePost, unlikePost, getComments, addComment, deleteComment, deletePost } from '../../api/postApi';
import { useAuth } from '../../context/AuthContext';
import { POST_CATEGORIES, ROLES } from '../../utils/constants';
import { formatTimeAgo, formatDate } from '../../utils/formatters';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { FiHeart, FiMessageSquare, FiUser, FiTrash2, FiArrowLeft } from 'react-icons/fi';

const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [isDeletePostOpen, setIsDeletePostOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        setLoading(true);
        const [postRes, commentsRes] = await Promise.all([
          getPostById(id),
          getComments(id).catch(() => ({ data: [] })) 
        ]);
        const postData = postRes.data;
        const commentsData = commentsRes.data || [];
        setPost(postData);
        const commentList = Array.isArray(commentsData) ? commentsData : (commentsData.content || []);
        setComments(commentList.length ? commentList : (postData?.comments || []));
      } catch (error) {
        toast.error('Failed to load post details');
      } finally {
        setLoading(false);
      }
    };
    fetchPostData();
  }, [id]);

  const isLiked = post ? (post.isLikedByCurrentUser ?? post.likes?.includes(user?.id)) : false;
  const currentLikes = post ? (post.likeCount ?? (post.likes?.length || 0)) : 0;

  const handleLikeToggle = async () => {
    try {
      if (isLiked) {
        await unlikePost(id);
      } else {
        await likePost(id);
      }
      setPost(prev => ({
        ...prev,
        isLikedByCurrentUser: !isLiked,
        likeCount: isLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1,
        likes: isLiked 
          ? (prev.likes || []).filter(uid => uid !== user?.id)
          : [...(prev.likes || []), user?.id]
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
      const res = await addComment(id, { content: commentText });
      const newComment = res.data;
      setComments(prev => [...prev, newComment]);
      setCommentText('');
      toast.success('Comment added');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const confirmDeleteComment = async () => {
    if (!commentToDelete) return;
    try {
      setIsDeleting(true);
      await deleteComment(id, commentToDelete);
      setComments(prev => prev.filter(c => (c._id || c.id) !== commentToDelete));
      toast.success('Comment deleted');
    } catch (error) {
      toast.error('Failed to delete comment');
    } finally {
      setIsDeleting(false);
      setCommentToDelete(null);
    }
  };

  const confirmDeletePost = async () => {
    try {
      setIsDeleting(true);
      await deletePost(id);
      toast.success('Post deleted');
      navigate('/posts');
    } catch (error) {
      toast.error('Failed to delete post');
      setIsDeleting(false);
      setIsDeletePostOpen(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!post) return <div className="text-center py-12 text-gray-500">Post not found.</div>;

  const authorName = post.alumniName || post.author?.name || 'Anonymous User';
  const authorImage = post.alumniProfilePictureUrl || post.author?.profileImage;
  const authorRole = post.alumniCompany 
    ? `${post.alumniJobTitle || 'Alumni'} at ${post.alumniCompany}` 
    : (post.author?.company ? `${post.author?.jobTitle || 'Alumni'} at ${post.author?.company}` : 'Alumni');
  const isPostAuthorOrAdmin = (post.alumniUserId || post.alumniId || post.author?.id) === user?.id || hasRole(ROLES.ADMIN);

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => navigate('/posts')}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
        >
          <FiArrowLeft /> Back to Feed
        </button>

        {isPostAuthorOrAdmin && (
          <button
            onClick={() => setIsDeletePostOpen(true)}
            className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer"
          >
            <FiTrash2 className="w-4 h-4" /> Delete Post
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="p-8 border-b border-gray-100">
          <div className="mb-4">
            <Badge variant="primary">{POST_CATEGORIES[post.category] || post.category}</Badge>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-6">{post.title}</h1>
          
          <div className="flex items-center gap-4">
            {authorImage ? (
              <img src={authorImage} alt={authorName} className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                <FiUser className="w-6 h-6" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900">{authorName}</h3>
              <p className="text-sm text-gray-500">{authorRole}</p>
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
            className={`flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer ${
              isLiked ? 'text-red-500 hover:text-red-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FiHeart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            <span>{currentLikes} Likes</span>
          </button>
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <FiMessageSquare className="w-5 h-5" />
            <span>{comments.length || post.commentCount || 0} Comments</span>
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
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
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
              const commentUserId = comment.userId || commentAuthor.id || commentAuthor._id;
              const commentAuthorName = comment.userName || commentAuthor.name || 'Anonymous User';
              const commentAuthorImage = comment.userProfilePictureUrl || commentAuthor.profileImage;
              const isOwnComment = commentUserId === user?.id || hasRole(ROLES.ADMIN);
              const commentId = comment.id || comment._id;
              
              return (
                <div key={commentId} className="flex gap-4">
                  {commentAuthorImage ? (
                    <img src={commentAuthorImage} alt={commentAuthorName} className="w-10 h-10 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center shrink-0">
                      <FiUser />
                    </div>
                  )}
                  <div className="flex-1 bg-gray-50 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-semibold text-gray-900 text-sm">{commentAuthorName}</span>
                        <span className="text-xs text-gray-500 ml-2">{formatTimeAgo(comment.createdAt)}</span>
                      </div>
                      {isOwnComment && (
                        <button 
                          onClick={() => setCommentToDelete(commentId)}
                          className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
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

      {/* Delete Comment Confirm Dialog */}
      <ConfirmDialog
        isOpen={Boolean(commentToDelete)}
        onCancel={() => setCommentToDelete(null)}
        onConfirm={confirmDeleteComment}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete Comment"
        variant="danger"
        isLoading={isDeleting}
      />

      {/* Delete Post Confirm Dialog */}
      <ConfirmDialog
        isOpen={isDeletePostOpen}
        onCancel={() => setIsDeletePostOpen(false)}
        onConfirm={confirmDeletePost}
        title="Delete Post"
        message="Are you sure you want to permanently delete this post and all its comments?"
        confirmText="Delete Post"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default PostDetailPage;
