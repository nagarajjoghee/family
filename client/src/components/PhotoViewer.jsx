import React, { useState, useEffect } from 'react';
import Comments from './Comments';
import './PhotoViewer.css';

const PhotoViewer = ({ photo, photoData, onClose }) => {
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  if (!photo) return null;

  return (
    <div className="photo-viewer-overlay" onClick={onClose}>
      <div className="photo-viewer-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-viewer" onClick={onClose}>×</button>
        
        <div className="viewer-main">
          <div className="viewer-image-container">
            {photoData ? (
              <img src={photoData} alt={photo.title || photo.file_name} />
            ) : (
              <div className="viewer-placeholder">
                <span>📷</span>
                <p>Photo not found</p>
              </div>
            )}
          </div>

          <div className="viewer-sidebar">
            <div className="viewer-info">
              <h2 className="viewer-title">{photo.title || photo.file_name}</h2>
              {photo.description && (
                <p className="viewer-description">{photo.description}</p>
              )}
              {photo.album_name && (
                <p className="viewer-album">Album: {photo.album_name}</p>
              )}
              <p className="viewer-uploader">Uploaded by: {photo.uploaded_by_name || 'Unknown'}</p>
              <p className="viewer-date">
                {new Date(photo.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            <div className="viewer-actions">
              <button
                className={`action-button ${showComments ? 'active' : ''}`}
                onClick={() => setShowComments(!showComments)}
              >
                💬 Comments
              </button>
            </div>

            {showComments && (
              <div className="viewer-comments-section">
                <Comments photoId={photo.id} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoViewer;

