import React, { useState, useEffect } from 'react';
import { photoAPI } from '../services/api';
import { getPhoto } from '../services/photoStorage';
import PhotoViewer from './PhotoViewer';
import './PhotoGallery.css';

const PhotoGallery = ({ albumId, onPhotoClick }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoData, setPhotoData] = useState({});

  useEffect(() => {
    loadPhotos();
  }, [albumId]);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      const response = await photoAPI.getAll(albumId);
      const photosList = response.data;
      setPhotos(photosList);

      // Load photo data from IndexedDB
      const dataMap = {};
      for (const photo of photosList) {
        try {
          const stored = await getPhoto(photo.id);
          if (stored) {
            dataMap[photo.id] = stored.data;
          }
        } catch (error) {
          console.error(`Failed to load photo ${photo.id}:`, error);
        }
      }
      setPhotoData(dataMap);
    } catch (error) {
      console.error('Failed to load photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo);
    if (onPhotoClick) {
      onPhotoClick(photo);
    }
  };

  const closeViewer = () => {
    setSelectedPhoto(null);
  };

  if (loading) {
    return (
      <div className="gallery-loading">
        <div className="loading-spinner"></div>
        <p>Loading photos...</p>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="gallery-empty">
        <p>No photos yet. Upload some to get started!</p>
      </div>
    );
  }

  return (
    <>
      <div className="photo-gallery">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="photo-item"
            onClick={() => handlePhotoClick(photo)}
          >
            <div className="photo-wrapper">
              {photoData[photo.id] ? (
                <img src={photoData[photo.id]} alt={photo.title || photo.file_name} />
              ) : (
                <div className="photo-placeholder">
                  <span>📷</span>
                  <p>Loading...</p>
                </div>
              )}
              <div className="photo-overlay">
                <div className="photo-info">
                  <h4 className="photo-title">{photo.title || photo.file_name}</h4>
                  {photo.album_name && (
                    <p className="photo-album">{photo.album_name}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedPhoto && (
        <PhotoViewer
          photo={selectedPhoto}
          photoData={photoData[selectedPhoto.id]}
          onClose={closeViewer}
        />
      )}
    </>
  );
};

export default PhotoGallery;

