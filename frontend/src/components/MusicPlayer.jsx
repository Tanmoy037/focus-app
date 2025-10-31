import { useState, useEffect } from 'react';
import { getMusicPlaylists, getPlaylist } from '../services/api';

export default function MusicPlayer({ isTimerRunning }) {
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);

  // Embedded YouTube streams for continuous play
  const YOUTUBE_EMBEDS = {
    lofi: 'jfKfPfyJRdk', // Lofi Girl - beats to relax/study
    rain: 'q76bMs-NwRk', // Rain sounds
    ambient: 'lTRiuFIWV54', // Deep Focus music
    nature: 'xNN7iTA57jM', // Forest sounds
    classical: 'jgpJVI3tDbY' // Classical study music
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const { data } = await getMusicPlaylists();
      setPlaylists(data.playlists || []);
    } catch (error) {
      console.error('Error fetching playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaylistSelect = async (playlistId) => {
    try {
      const { data } = await getPlaylist(playlistId);
      setSelectedPlaylist({ ...data, id: playlistId });
      setCurrentTrack(data.tracks[0]);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error loading playlist:', error);
      // Fallback: Set playlist directly with ID so embed works
      const playlistNames = {
        lofi: { name: 'Lofi Hip Hop', description: 'Chill beats to focus and relax' },
        rain: { name: 'Rain Sounds', description: 'Natural rain sounds for deep focus' },
        ambient: { name: 'Ambient Music', description: 'Calm instrumental music for concentration' },
        nature: { name: 'Nature Sounds', description: 'Forest, ocean, and nature ambience' },
        classical: { name: 'Classical Focus', description: 'Classical music for enhanced concentration' }
      };
      setSelectedPlaylist({ id: playlistId, ...playlistNames[playlistId], tracks: [] });
      setIsPlaying(true);
    }
  };

  const getPlaylistIcon = (id) => {
    const icons = {
      lofi: '🎧',
      rain: '🌧️',
      ambient: '🎵',
      nature: '🌲',
      classical: '🎻'
    };
    return icons[id] || '🎵';
  };

  const getPlaylistColor = (id) => {
    const colors = {
      lofi: '#8b5cf6',
      rain: '#3b82f6',
      ambient: '#ec4899',
      nature: '#10b981',
      classical: '#f59e0b'
    };
    return colors[id] || '#8b5cf6';
  };

  // Hardcoded playlists if API fails
  const defaultPlaylists = [
    { id: 'lofi', name: 'Lofi Hip Hop', track_count: 2 },
    { id: 'rain', name: 'Rain Sounds', track_count: 2 },
    { id: 'ambient', name: 'Ambient Music', track_count: 2 },
    { id: 'nature', name: 'Nature Sounds', track_count: 2 },
    { id: 'classical', name: 'Classical Focus', track_count: 1 }
  ];

  const displayPlaylists = playlists.length > 0 ? playlists : defaultPlaylists;

  if (loading) {
    return (
      <div style={{ marginTop: '40px' }}>
        <div style={{
          padding: '24px',
          background: '#0a0a0a',
          borderRadius: '12px',
          border: '1px solid #27272a',
          textAlign: 'center'
        }}>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '40px' }}>
      <div style={{
        padding: '24px',
        background: '#0a0a0a',
        borderRadius: '12px',
        border: '1px solid #27272a'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '32px' }}>🎵</div>
            <div>
              <h4 style={{ fontSize: '20px', fontWeight: '600', color: '#f4f4f5', marginBottom: '4px' }}>
                Focus Music
              </h4>
              <p style={{ fontSize: '14px', color: '#a1a1aa' }}>
                {selectedPlaylist ? 'Now Playing' : 'Choose your focus soundtrack'}
              </p>
            </div>
          </div>
          {selectedPlaylist && (
            <button
              onClick={() => {
                setSelectedPlaylist(null);
                setCurrentTrack(null);
                setIsPlaying(false);
              }}
              className="btn btn-secondary"
              style={{ fontSize: '14px', padding: '8px 16px' }}
            >
              ← Back to Playlists
            </button>
          )}
        </div>

        {!selectedPlaylist ? (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '16px',
              marginBottom: '16px'
            }}>
              {displayPlaylists.map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={() => handlePlaylistSelect(playlist.id)}
                  className="btn"
                  style={{
                    background: '#18181b',
                    border: `2px solid ${getPlaylistColor(playlist.id)}40`,
                    flexDirection: 'column',
                    gap: '12px',
                    padding: '20px 12px',
                    height: 'auto',
                    transition: 'all 0.3s',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = getPlaylistColor(playlist.id);
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = `0 8px 20px ${getPlaylistColor(playlist.id)}40`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = getPlaylistColor(playlist.id) + '40';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ fontSize: '48px' }}>{getPlaylistIcon(playlist.id)}</div>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#f4f4f5', textAlign: 'center', lineHeight: '1.3' }}>
                    {playlist.name}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#a1a1aa',
                    textAlign: 'center',
                    padding: '4px 8px',
                    background: getPlaylistColor(playlist.id) + '20',
                    borderRadius: '4px'
                  }}>
                    Click to Play
                  </div>
                </button>
              ))}
            </div>
            
            <div style={{
              padding: '14px',
              background: 'rgba(139, 92, 246, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              fontSize: '13px',
              color: '#a1a1aa',
              textAlign: 'center'
            }}>
              💡 Select a playlist above to start playing focus music
            </div>
          </>
        ) : (
          <div>
            {/* Now Playing Header */}
            <div style={{
              padding: '16px',
              background: 'linear-gradient(135deg, ' + getPlaylistColor(selectedPlaylist.id) + '20 0%, ' + getPlaylistColor(selectedPlaylist.id) + '10 100%)',
              borderRadius: '8px',
              marginBottom: '16px',
              border: '1px solid ' + getPlaylistColor(selectedPlaylist.id) + '40'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ fontSize: '28px' }}>{getPlaylistIcon(selectedPlaylist.id)}</div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#f4f4f5' }}>
                    {selectedPlaylist.name}
                  </div>
                  <div style={{ fontSize: '13px', color: '#a1a1aa' }}>
                    {selectedPlaylist.description}
                  </div>
                </div>
              </div>
            </div>

            {/* YouTube Player Embed */}
            <div style={{
              position: 'relative',
              paddingBottom: '56.25%', // 16:9 aspect ratio
              height: 0,
              overflow: 'hidden',
              borderRadius: '12px',
              border: `2px solid ${getPlaylistColor(selectedPlaylist.id)}`,
              marginBottom: '16px',
              boxShadow: `0 4px 20px ${getPlaylistColor(selectedPlaylist.id)}40`
            }}>
              <iframe
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%'
                }}
                src={`https://www.youtube.com/embed/${YOUTUBE_EMBEDS[selectedPlaylist.id]}?autoplay=1&mute=0&loop=1&playlist=${YOUTUBE_EMBEDS[selectedPlaylist.id]}&controls=1&modestbranding=1`}
                title={selectedPlaylist.name}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            {/* Now Playing Info */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              background: '#18181b',
              borderRadius: '8px',
              border: '1px solid #27272a',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: `linear-gradient(135deg, ${getPlaylistColor(selectedPlaylist.id)} 0%, ${getPlaylistColor(selectedPlaylist.id)}80 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}>
                  ▶️
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#f4f4f5' }}>
                    Now Playing
                  </div>
                  <div style={{ fontSize: '13px', color: '#a1a1aa' }}>
                    {selectedPlaylist.name}
                  </div>
                </div>
              </div>
              <div style={{
                padding: '6px 12px',
                background: `${getPlaylistColor(selectedPlaylist.id)}20`,
                borderRadius: '6px',
                fontSize: '12px',
                color: getPlaylistColor(selectedPlaylist.id),
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  background: getPlaylistColor(selectedPlaylist.id),
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite'
                }}></span>
                LIVE
              </div>
            </div>

            {/* Track List - only if tracks available */}
            {selectedPlaylist.tracks && selectedPlaylist.tracks.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#a1a1aa', marginBottom: '12px' }}>
                  Available Tracks:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedPlaylist.tracks.map((track, index) => (
                  <a
                    key={track.id}
                    href={track.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      background: '#18181b',
                      border: '1px solid #27272a',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = getPlaylistColor(selectedPlaylist.id)}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#27272a'}
                  >
                    <div style={{ fontSize: '20px' }}>{index === 0 ? '▶️' : '🎵'}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#f4f4f5' }}>
                        {track.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#71717a' }}>
                        {track.artist} • {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                      </div>
                    </div>
                  </a>
                  ))}
                </div>
              </div>
            )}

            {/* Player Tips */}
            <div style={{
              marginTop: '16px',
              padding: '14px',
              background: 'rgba(139, 92, 246, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              fontSize: '13px',
              color: '#a1a1aa',
              textAlign: 'center'
            }}>
              💡 Use YouTube player controls to adjust volume and playback
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

