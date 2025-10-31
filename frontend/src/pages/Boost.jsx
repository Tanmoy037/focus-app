import { useState, useEffect } from 'react';
import { getRecommendations, searchVideos } from '../services/api';

export default function Boost() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [reason, setReason] = useState('');

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const { data } = await getRecommendations(6);
      setVideos(data.videos || []);
      setReason(data.reason || '');
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const { data } = await searchVideos(searchQuery, 10);
      setSearchResults(data.videos || []);
    } catch (error) {
      console.error('Error searching videos:', error);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{
          fontSize: '48px',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px'
        }}>
          <span>🚀</span>
          <span>Boost</span>
        </h1>
        <p style={{ color: '#a1a1aa', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
          Get personalized video recommendations based on your goals to help you achieve them faster
        </p>
      </div>

      {/* Search Bar */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <form onSubmit={handleSearch}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              className="input"
              style={{ flex: 1 }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for motivational videos, tutorials, etc..."
            />
            <button type="submit" className="btn btn-primary" disabled={searching}>
              {searching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div style={{ marginBottom: '48px' }}>
          <div className="card" style={{ marginBottom: '20px', background: '#18181b', border: '1px solid #27272a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#f4f4f5' }}>
                Search Results
              </h2>
              <button
                onClick={() => {
                  setSearchResults([]);
                  setSearchQuery('');
                }}
                className="btn btn-secondary"
                style={{ fontSize: '14px', padding: '8px 16px' }}
              >
                Clear
              </button>
            </div>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px'
          }}>
            {searchResults.map((video) => (
              <VideoCard key={video.video_id} video={video} />
            ))}
          </div>
        </div>
      )}

      {/* Recommended Videos */}
      <div>
        <div className="card" style={{ marginBottom: '20px', background: 'rgba(255,255,255,0.1)', border: 'none' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: 'white', marginBottom: '8px' }}>
            Recommended for You
          </h2>
          {reason && (
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
              {reason}
            </p>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div className="spinner"></div>
          </div>
        ) : videos.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎯</div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: '#f4f4f5' }}>
              No recommendations yet
            </h3>
            <p style={{ color: '#a1a1aa', marginBottom: '20px' }}>
              Create some goals to get personalized video recommendations!
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px'
          }}>
            {videos.map((video) => (
              <VideoCard key={video.video_id} video={video} />
            ))}
          </div>
        )}
      </div>

      {/* Pro Tip */}
      <div className="card" style={{
        marginTop: '48px',
        background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
        color: 'white',
        border: '1px solid rgba(139, 92, 246, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'start', gap: '16px' }}>
          <div style={{ fontSize: '32px' }}>💡</div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
              Pro Tip
            </h3>
            <p style={{ opacity: 0.95, lineHeight: '1.6' }}>
              The more specific your goals are, the better video recommendations you'll get!
              Try creating goals with detailed titles and categories to discover the most relevant content.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function VideoCard({ video }) {
  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: 'none' }}
    >
      <div className="card" style={{
        padding: '0',
        overflow: 'hidden',
        height: '100%',
        transition: 'all 0.2s',
        cursor: 'pointer',
        background: '#18181b',
        border: '1px solid #27272a'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.borderColor = '#8b5cf6';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(139, 92, 246, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = '#27272a';
        e.currentTarget.style.boxShadow = 'none';
      }}
      >
        <div style={{ position: 'relative' }}>
          <img
            src={video.thumbnail_url}
            alt={video.title}
            style={{
              width: '100%',
              height: '180px',
              objectFit: 'cover'
            }}
          />
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            YouTube
          </div>
        </div>
        <div style={{ padding: '16px' }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '8px',
            color: '#f4f4f5',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            minHeight: '48px'
          }}>
            {video.title}
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#71717a',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {video.channel_title}
          </p>
          <div style={{
            marginTop: '12px',
            padding: '8px 12px',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
            borderRadius: '6px',
            textAlign: 'center',
            fontSize: '13px',
            fontWeight: '600',
            color: 'white'
          }}>
            Watch Now →
          </div>
        </div>
      </div>
    </a>
  );
}

