import React, { useState, useEffect } from 'react';
import { commentAPI, authAPI } from '../services/api';
import './Comments.css';

const Comments = ({ photoId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadComments();
    loadCurrentUser();
  }, [photoId]);

  const loadCurrentUser = async () => {
    try {
      const response = await authAPI.getMe();
      setCurrentUser(response.data);
    } catch (error) {
      console.error('Failed to load current user:', error);
    }
  };

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await commentAPI.getByPhotoId(photoId);
      setComments(response.data);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await commentAPI.create({
        photoId,
        content: newComment.trim(),
      });
      setComments([...comments, response.data]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert('Failed to add comment. Please try again.');
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await commentAPI.delete(commentId);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert('Failed to delete comment. Please try again.');
    }
  };

  if (loading && comments.length === 0) {
    return (
      <div className="comments-loading">
        <p>Loading comments...</p>
      </div>
    );
  }

  return (
    <div className="comments-container">
      <h3 className="comments-title">Comments ({comments.length})</h3>

      <div className="comments-list">
        {comments.length === 0 ? (
          <p className="no-comments">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <div className="comment-header">
                <span className="comment-author">
                  {comment.full_name || comment.username || 'Anonymous'}
                </span>
                <span className="comment-date">
                  {new Date(comment.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </span>
                {currentUser && (currentUser.id === comment.user_id) && (
                  <button
                    className="delete-comment"
                    onClick={() => handleDelete(comment.id)}
                    title="Delete comment"
                  >
                    ×
                  </button>
                )}
              </div>
              <p className="comment-content">{comment.content}</p>
            </div>
          ))
        )}
      </div>

      <form className="comment-form" onSubmit={handleSubmit}>
        <textarea
          className="comment-input"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          rows="3"
        />
        <button type="submit" className="comment-submit">
          Post Comment
        </button>
      </form>
    </div>
  );
};

export default Comments;

