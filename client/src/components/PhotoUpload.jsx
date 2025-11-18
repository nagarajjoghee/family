import React, { useState, useRef } from 'react';
import { photoAPI } from '../services/api';
import { savePhoto } from '../services/photoStorage';
import './PhotoUpload.css';

const PhotoUpload = ({ onUploadSuccess, selectedAlbumId }) => {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (newFiles) => {
    const imageFiles = newFiles.filter(file => file.type.startsWith('image/'));
    setFiles(prev => [...prev, ...imageFiles]);

    // Create previews
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews(prev => [...prev, { file, preview: e.target.result }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Upload metadata to backend
        const photoData = {
          title: file.name,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          albumId: selectedAlbumId || null,
        };

        const response = await photoAPI.create(photoData);
        const photoId = response.data.id;

        // Save file to IndexedDB
        await savePhoto(photoId, file, {
          title: photoData.title,
          albumId: photoData.albumId,
        });
      }

      setFiles([]);
      setPreviews([]);
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload photos. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="photo-upload-container">
      <div
        ref={dropZoneRef}
        className={`drop-zone ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />
        <div className="drop-zone-content">
          <div className="upload-icon">📷</div>
          <p className="drop-zone-text">Drag and drop photos here or click to browse</p>
          <p className="drop-zone-hint">Supports multiple images</p>
        </div>
      </div>

      {previews.length > 0 && (
        <div className="preview-container">
          <h3 className="preview-title">Preview ({previews.length} photo{previews.length > 1 ? 's' : ''})</h3>
          <div className="preview-grid">
            {previews.map((preview, index) => (
              <div key={index} className="preview-item">
                <button
                  className="remove-preview"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                >
                  ×
                </button>
                <img src={preview.preview} alt={`Preview ${index + 1}`} />
                <p className="preview-name">{preview.file.name}</p>
              </div>
            ))}
          </div>
          <button
            className="upload-button"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : `Upload ${previews.length} Photo${previews.length > 1 ? 's' : ''}`}
          </button>
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;

