import React, { useState, useEffect } from 'react';
import { authAPI } from './services/api';
import Header from './components/Header';
import Marquee from './components/Marquee';
import Login from './components/Login';
import AlbumList from './components/AlbumList';
import PhotoUpload from './components/PhotoUpload';
import PhotoGallery from './components/PhotoGallery';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedAlbumId, setSelectedAlbumId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isMounted = true;
    
    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (isMounted) {
        console.warn('Auth check taking too long, setting loading to false');
        setLoading(false);
      }
    }, 5000);

    const performCheck = async () => {
      try {
        await authAPI.getMe();
        if (isMounted) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.log('Not authenticated, showing login page');
        if (isMounted) {
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          clearTimeout(timeout);
        }
      }
    };

    performCheck();

    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, []);


  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleAlbumSelect = (albumId) => {
    setSelectedAlbumId(albumId);
    setRefreshKey(prev => prev + 1);
  };

  const handleUploadSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app">
      <Header />
      <Marquee />
      
      <div className="app-content">
        <div className="app-sidebar">
          <div className="sidebar-header">
            <h2 className="sidebar-title">Navigation</h2>
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
          
          <AlbumList
            selectedAlbumId={selectedAlbumId}
            onAlbumSelect={handleAlbumSelect}
            onAlbumCreate={handleAlbumSelect}
          />
        </div>

        <div className="app-main">
          <div className="main-header">
            <h1 className="main-title">
              {selectedAlbumId ? 'Album Photos' : 'All Photos'}
            </h1>
          </div>

          <PhotoUpload
            selectedAlbumId={selectedAlbumId}
            onUploadSuccess={handleUploadSuccess}
          />

          <PhotoGallery
            key={refreshKey}
            albumId={selectedAlbumId}
          />
        </div>
      </div>
    </div>
  );
}

export default App;

