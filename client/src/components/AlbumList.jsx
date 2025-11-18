import React, { useState, useEffect } from 'react';
import { albumAPI } from '../services/api';
import './AlbumList.css';

const AlbumList = ({ selectedAlbumId, onAlbumSelect, onAlbumCreate, onCreateNew }) => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [newAlbumDescription, setNewAlbumDescription] = useState('');

  useEffect(() => {
    loadAlbums();
  }, []);

  const loadAlbums = async () => {
    try {
      setLoading(true);
      const response = await albumAPI.getAll();
      setAlbums(response.data);
    } catch (error) {
      console.error('Failed to load albums:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlbum = async (e) => {
    e.preventDefault();
    if (!newAlbumName.trim()) return;

    try {
      const response = await albumAPI.create({
        name: newAlbumName.trim(),
        description: newAlbumDescription.trim() || null,
      });
      setAlbums([...albums, response.data]);
      setNewAlbumName('');
      setNewAlbumDescription('');
      setShowCreateForm(false);
      if (onAlbumCreate) {
        onAlbumCreate(response.data);
      }
    } catch (error) {
      console.error('Failed to create album:', error);
      alert('Failed to create album. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="album-list-loading">
        <p>Loading albums...</p>
      </div>
    );
  }

  return (
    <div className="album-list-container">
      <div className="album-list-header">
        <h2 className="album-list-title">Albums</h2>
        <button
          className="create-album-button"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : '+ New Album'}
        </button>
      </div>

      {showCreateForm && (
        <form className="create-album-form" onSubmit={handleCreateAlbum}>
          <input
            type="text"
            className="album-name-input"
            placeholder="Album Name"
            value={newAlbumName}
            onChange={(e) => setNewAlbumName(e.target.value)}
            required
          />
          <textarea
            className="album-description-input"
            placeholder="Description (optional)"
            value={newAlbumDescription}
            onChange={(e) => setNewAlbumDescription(e.target.value)}
            rows="2"
          />
          <button type="submit" className="submit-album-button">
            Create Album
          </button>
        </form>
      )}

      <div className="album-list">
        <div
          className={`album-item ${selectedAlbumId === null ? 'active' : ''}`}
          onClick={() => onAlbumSelect(null)}
        >
          <div className="album-icon">📸</div>
          <div className="album-info">
            <h3 className="album-name">All Photos</h3>
            <p className="album-count">View all photos</p>
          </div>
        </div>

        {albums.map((album) => (
          <div
            key={album.id}
            className={`album-item ${selectedAlbumId === album.id ? 'active' : ''}`}
            onClick={() => onAlbumSelect(album.id)}
          >
            <div className="album-icon">📁</div>
            <div className="album-info">
              <h3 className="album-name">{album.name}</h3>
              <p className="album-count">
                {album.photo_count || 0} photo{album.photo_count !== 1 ? 's' : ''}
              </p>
              {album.description && (
                <p className="album-description">{album.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlbumList;

