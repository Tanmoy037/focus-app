import { useState, useEffect, useRef } from 'react';
import { createActivity, getTodos, getGoals } from '../services/api';
import MusicPlayer from '../components/MusicPlayer';

export default function Focus() {
  const [mode, setMode] = useState('pomodoro'); // 'pomodoro' or 'straight'
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [customMinutes, setCustomMinutes] = useState(25);
  const [session, setSession] = useState('focus'); // 'focus' or 'break'
  const [completedSessions, setCompletedSessions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [visual, setVisual] = useState('coffee'); // 'coffee' or 'hourglass'
  const [showTodoSelector, setShowTodoSelector] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [todos, setTodos] = useState([]);
  const [goals, setGoals] = useState([]);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    fetchTodosAndGoals();
  }, []);

  const fetchTodosAndGoals = async () => {
    try {
      const [todosRes, goalsRes] = await Promise.all([
        getTodos({ completed: false }),
        getGoals({ achieved: false })
      ]);
      setTodos(todosRes.data);
      setGoals(goalsRes.data);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  // Pomodoro settings (customizable)
  const [pomodoroSettings, setPomodoroSettings] = useState({
    workDuration: 25,
    shortBreak: 5,
    longBreak: 15,
    sessionsBeforeLongBreak: 4
  });

  const POMODORO_WORK = pomodoroSettings.workDuration * 60;
  const POMODORO_SHORT_BREAK = pomodoroSettings.shortBreak * 60;
  const POMODORO_LONG_BREAK = pomodoroSettings.longBreak * 60;

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft]);

  const handleTimerComplete = async () => {
    setIsRunning(false);
    
    // Play completion sound (future enhancement)
    
    if (mode === 'pomodoro') {
      if (session === 'focus') {
        // Log completed focus session to backend
        const focusMinutes = POMODORO_WORK / 60;
        await logFocusSession(focusMinutes, 'Pomodoro Focus Session');
        
        setCompletedSessions(prev => prev + 1);
        
        // Switch to break
        if ((completedSessions + 1) % pomodoroSettings.sessionsBeforeLongBreak === 0) {
          setSession('break');
          setTimeLeft(POMODORO_LONG_BREAK);
        } else {
          setSession('break');
          setTimeLeft(POMODORO_SHORT_BREAK);
        }
      } else {
        // Break completed, back to focus
        setSession('focus');
        setTimeLeft(POMODORO_WORK);
      }
    } else {
      // Straight timer completed
      await logFocusSession(customMinutes, 'Deep Focus Session');
    }
  };

  const logFocusSession = async (minutes, title) => {
    try {
      const activityData = {
        activity_type: 'focus_session',
        title: selectedTodo ? `Focus: ${selectedTodo.title}` : title,
        description: selectedTodo 
          ? `Worked on "${selectedTodo.title}" for ${minutes} minutes using ${mode} mode`
          : `Completed ${minutes} minute focus session using ${mode} mode`,
        duration_minutes: minutes,
        extra_data: {
          mode: mode,
          session_type: session,
          todo_id: selectedTodo?.id || null,
          goal_id: selectedTodo?.goal_id || null,
          completed_at: new Date().toISOString()
        }
      };
      await createActivity(activityData);
      console.log('Focus session logged successfully!');
      
      // Refresh todos after session
      fetchTodosAndGoals();
    } catch (error) {
      console.error('Error logging focus session:', error);
    }
  };

  const startTimer = () => {
    // Show todo selector before starting (only for work sessions)
    if (session === 'focus' && !selectedTodo && todos.length > 0) {
      setShowTodoSelector(true);
    } else {
      setIsRunning(true);
      if (!startTimeRef.current) {
        startTimeRef.current = new Date();
      }
    }
  };

  const confirmStartWithTodo = (todo) => {
    setSelectedTodo(todo);
    setShowTodoSelector(false);
    setIsRunning(true);
    if (!startTimeRef.current) {
      startTimeRef.current = new Date();
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
    startTimeRef.current = null;
    setSelectedTodo(null);
    
    if (mode === 'pomodoro') {
      setTimeLeft(POMODORO_WORK);
      setSession('focus');
    } else {
      setTimeLeft(customMinutes * 60);
    }
  };

  const handleModeChange = (newMode) => {
    resetTimer();
    setMode(newMode);
    if (newMode === 'pomodoro') {
      setTimeLeft(POMODORO_WORK);
      setSession('focus');
    } else {
      setTimeLeft(customMinutes * 60);
    }
  };

  const handleCustomTimeChange = (minutes) => {
    setCustomMinutes(minutes);
    if (mode === 'straight' && !isRunning) {
      setTimeLeft(minutes * 60);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const totalTime = mode === 'pomodoro' 
      ? (session === 'focus' ? POMODORO_WORK : POMODORO_SHORT_BREAK)
      : customMinutes * 60;
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  const getCoffeeLevel = () => {
    return 100 - getProgress();
  };

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{
          fontSize: '48px',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '16px'
        }}>
          Focus Session ⚡
        </h1>
        <p style={{ color: '#a1a1aa', fontSize: '18px' }}>
          Deep work mode - Eliminate distractions and get things done
        </p>
      </div>

      {/* Mode Selection */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '40px', alignItems: 'center' }}>
        <button
          onClick={() => handleModeChange('pomodoro')}
          className="btn"
          style={{
            background: mode === 'pomodoro' ? 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)' : '#27272a',
            color: 'white',
            border: mode === 'pomodoro' ? '1px solid #a855f7' : '1px solid #3f3f46',
            padding: '12px 32px',
            fontSize: '16px'
          }}
        >
          🍅 Pomodoro
        </button>
        <button
          onClick={() => handleModeChange('straight')}
          className="btn"
          style={{
            background: mode === 'straight' ? 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)' : '#27272a',
            color: 'white',
            border: mode === 'straight' ? '1px solid #a855f7' : '1px solid #3f3f46',
            padding: '12px 32px',
            fontSize: '16px'
          }}
        >
          ⏱️ Custom Timer
        </button>
        
        {/* Settings Button */}
        {mode === 'pomodoro' && !isRunning && (
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="btn btn-secondary"
            style={{ padding: '12px 20px', fontSize: '16px' }}
          >
            ⚙️ Settings
          </button>
        )}
      </div>

      {/* Pomodoro Settings Panel */}
      {mode === 'pomodoro' && showSettings && !isRunning && (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto 40px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#f4f4f5', marginBottom: '20px' }}>
            ⚙️ Pomodoro Settings
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#e4e4e7', fontWeight: '500' }}>
                Work Duration (minutes)
              </label>
              <input
                type="number"
                className="input"
                value={pomodoroSettings.workDuration}
                onChange={(e) => setPomodoroSettings({ ...pomodoroSettings, workDuration: parseInt(e.target.value) || 25 })}
                min="1"
                max="60"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#e4e4e7', fontWeight: '500' }}>
                Short Break (minutes)
              </label>
              <input
                type="number"
                className="input"
                value={pomodoroSettings.shortBreak}
                onChange={(e) => setPomodoroSettings({ ...pomodoroSettings, shortBreak: parseInt(e.target.value) || 5 })}
                min="1"
                max="30"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#e4e4e7', fontWeight: '500' }}>
                Long Break (minutes)
              </label>
              <input
                type="number"
                className="input"
                value={pomodoroSettings.longBreak}
                onChange={(e) => setPomodoroSettings({ ...pomodoroSettings, longBreak: parseInt(e.target.value) || 15 })}
                min="1"
                max="60"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#e4e4e7', fontWeight: '500' }}>
                Sessions Before Long Break
              </label>
              <input
                type="number"
                className="input"
                value={pomodoroSettings.sessionsBeforeLongBreak}
                onChange={(e) => setPomodoroSettings({ ...pomodoroSettings, sessionsBeforeLongBreak: parseInt(e.target.value) || 4 })}
                min="2"
                max="10"
              />
            </div>
          </div>
          <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
            <button
              onClick={() => {
                setTimeLeft(pomodoroSettings.workDuration * 60);
                setShowSettings(false);
              }}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              Apply Settings
            </button>
            <button
              onClick={() => {
                setPomodoroSettings({ workDuration: 25, shortBreak: 5, longBreak: 15, sessionsBeforeLongBreak: 4 });
                setTimeLeft(25 * 60);
              }}
              className="btn btn-secondary"
            >
              Reset to Default
            </button>
          </div>
          <div style={{
            marginTop: '16px',
            padding: '12px',
            background: 'rgba(139, 92, 246, 0.1)',
            borderRadius: '6px',
            fontSize: '13px',
            color: '#a1a1aa',
            textAlign: 'center'
          }}>
            💡 Classic Pomodoro: 25 min work, 5 min short break, 15 min long break every 4 sessions
          </div>
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '32px',
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        {/* Timer Display */}
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          {/* Session Type Badge */}
          {mode === 'pomodoro' && (
            <div style={{ marginBottom: '24px' }}>
              <span className="badge" style={{
                background: session === 'focus' 
                  ? 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)' 
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                padding: '10px 24px',
                fontSize: '15px',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                fontWeight: '700',
                boxShadow: session === 'focus' 
                  ? '0 4px 12px rgba(139, 92, 246, 0.4)'
                  : '0 4px 12px rgba(16, 185, 129, 0.4)'
              }}>
                {session === 'focus' ? '🎯 FOCUS TIME' : '☕ BREAK TIME - RELAX!'}
              </span>
            </div>
          )}
          
          {/* Current Settings Display (Pomodoro) */}
          {mode === 'pomodoro' && !isRunning && (
            <div style={{
              marginBottom: '20px',
              padding: '12px',
              background: '#18181b',
              borderRadius: '8px',
              border: '1px solid #27272a',
              fontSize: '13px',
              color: '#a1a1aa',
              textAlign: 'center'
            }}>
              {pomodoroSettings.workDuration}min work • {pomodoroSettings.shortBreak}min break • {pomodoroSettings.longBreak}min long break (every {pomodoroSettings.sessionsBeforeLongBreak} sessions)
            </div>
          )}

          {/* Working On Display */}
          {selectedTodo && (
            <div style={{
              marginBottom: '20px',
              padding: '16px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
              borderRadius: '12px',
              border: '1px solid #a855f7',
              boxShadow: '0 4px 16px rgba(139, 92, 246, 0.3)'
            }}>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', marginBottom: '6px', fontWeight: '600', letterSpacing: '1px' }}>
                WORKING ON:
              </div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: 'white', marginBottom: '4px' }}>
                {selectedTodo.title}
              </div>
              {selectedTodo.goal_id && (
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)' }}>
                  🎯 {goals.find(g => g.id === selectedTodo.goal_id)?.title || 'Goal'}
                </div>
              )}
            </div>
          )}

          {/* Time Display */}
          <div style={{
            fontSize: '96px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '32px',
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-2px'
          }}>
            {formatTime(timeLeft)}
          </div>

          {/* Progress Bar */}
          <div style={{
            width: '100%',
            height: '8px',
            background: '#27272a',
            borderRadius: '4px',
            overflow: 'hidden',
            marginBottom: '32px'
          }}>
            <div style={{
              width: `${getProgress()}%`,
              height: '100%',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
              transition: 'width 1s linear',
              borderRadius: '4px'
            }} />
          </div>

          {/* Custom Time Input (Straight mode only) */}
          {mode === 'straight' && !isRunning && (
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '12px', color: '#a1a1aa', fontSize: '14px' }}>
                Set Duration (minutes)
              </label>
              <input
                type="number"
                className="input"
                value={customMinutes}
                onChange={(e) => handleCustomTimeChange(parseInt(e.target.value) || 1)}
                min="1"
                max="120"
                style={{ textAlign: 'center', fontSize: '18px', maxWidth: '120px', margin: '0 auto' }}
              />
            </div>
          )}

          {/* Controls */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            {!isRunning ? (
              <button
                onClick={startTimer}
                className="btn btn-primary"
                style={{ fontSize: '18px', padding: '16px 48px' }}
              >
                ▶️ Start
              </button>
            ) : (
              <button
                onClick={pauseTimer}
                className="btn btn-secondary"
                style={{ fontSize: '18px', padding: '16px 48px' }}
              >
                ⏸️ Pause
              </button>
            )}
            <button
              onClick={resetTimer}
              className="btn btn-danger"
              style={{ fontSize: '18px', padding: '16px 48px' }}
            >
              🔄 Reset
            </button>
          </div>

          {/* Pomodoro Stats */}
          {mode === 'pomodoro' && (
            <div style={{ marginTop: '32px', padding: '16px', background: '#0a0a0a', borderRadius: '8px' }}>
              <div style={{ fontSize: '14px', color: '#a1a1aa' }}>
                Completed Sessions: <span style={{ color: '#8b5cf6', fontWeight: '700', fontSize: '18px' }}>{completedSessions}</span>
              </div>
            </div>
          )}
        </div>

        {/* Visual Elements */}
        <div className="card" style={{ padding: '48px 24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#f4f4f5', marginBottom: '24px', textAlign: 'center' }}>
            Your Focus Companion
          </h3>

          {/* Visual Selector */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '32px' }}>
            <button
              onClick={() => setVisual('coffee')}
              className="btn"
              style={{
                background: visual === 'coffee' ? 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)' : '#27272a',
                color: 'white',
                border: visual === 'coffee' ? '1px solid #a855f7' : '1px solid #3f3f46',
                padding: '8px 20px',
                fontSize: '14px'
              }}
            >
              ☕ Coffee
            </button>
            <button
              onClick={() => setVisual('hourglass')}
              className="btn"
              style={{
                background: visual === 'hourglass' ? 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)' : '#27272a',
                color: 'white',
                border: visual === 'hourglass' ? '1px solid #a855f7' : '1px solid #3f3f46',
                padding: '8px 20px',
                fontSize: '14px'
              }}
            >
              ⏳ Hourglass
            </button>
          </div>

          {/* Coffee Cup - Improved Premium Design */}
          {visual === 'coffee' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '200px', height: '260px' }}>
                <svg viewBox="0 0 200 260" style={{ width: '100%', height: '100%' }}>
                  <defs>
                    <linearGradient id="coffeeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#a855f7', stopOpacity: 1 }} />
                      <stop offset="50%" style={{ stopColor: '#8b5cf6', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#ec4899', stopOpacity: 1 }} />
                    </linearGradient>
                    <radialGradient id="coffeeShine">
                      <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 0.4 }} />
                      <stop offset="100%" style={{ stopColor: '#ffffff', stopOpacity: 0 }} />
                    </radialGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  
                  {/* Saucer */}
                  <ellipse cx="100" cy="230" rx="70" ry="10" fill="#27272a" stroke="#52525b" strokeWidth="3"/>
                  <ellipse cx="100" cy="228" rx="65" ry="8" fill="#18181b"/>
                  
                  {/* Cup body - realistic mug shape */}
                  <path
                    d="M60 90 L58 210 Q58 225 75 225 L125 225 Q142 225 142 210 L140 90 Q140 85 135 85 L65 85 Q60 85 60 90 Z"
                    fill="#1a1a1d"
                    stroke="#71717a"
                    strokeWidth="4"
                    strokeLinejoin="round"
                  />
                  
                  {/* Cup inner shadow for depth */}
                  <path
                    d="M65 88 L63 210 Q63 220 75 220 L125 220 Q137 220 137 210 L135 88"
                    fill="none"
                    stroke="#0a0a0a"
                    strokeWidth="3"
                    opacity="0.6"
                  />
                  
                  {/* Handle - 3D effect */}
                  <path
                    d="M142 120 Q172 120 172 155 Q172 190 142 190"
                    fill="none"
                    stroke="#71717a"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                  <path
                    d="M145 125 Q165 125 165 155 Q165 185 145 185"
                    fill="none"
                    stroke="#52525b"
                    strokeWidth="4"
                  />
                  <path
                    d="M146 128 Q162 128 162 155 Q162 182 146 182"
                    fill="none"
                    stroke="#27272a"
                    strokeWidth="2.5"
                  />
                  
                  {/* Coffee liquid - beautiful gradient */}
                  <path
                    d={`M65 ${90 + (130 * (100 - getCoffeeLevel()) / 100)} L63 ${92 + (130 * (100 - getCoffeeLevel()) / 100)} L63 210 Q63 220 75 220 L125 220 Q137 220 137 210 L137 ${92 + (130 * (100 - getCoffeeLevel()) / 100)} L135 ${90 + (130 * (100 - getCoffeeLevel()) / 100)} Z`}
                    fill="url(#coffeeGradient)"
                    style={{ transition: 'all 1s ease' }}
                    filter="url(#glow)"
                  />
                  
                  {/* Coffee surface shine */}
                  <ellipse 
                    cx="100" 
                    cy={92 + (130 * (100 - getCoffeeLevel()) / 100)} 
                    rx="37" 
                    ry="5" 
                    fill="url(#coffeeShine)"
                    style={{ transition: 'all 1s ease' }}
                  />
                  
                  {/* Steam - Beautiful wavy animation */}
                  {isRunning && getCoffeeLevel() > 10 && (
                    <>
                      <path d="M75 50 Q73 30 77 35 Q79 40 77 25" stroke="#a855f7" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.7">
                        <animate attributeName="d" values="M75 50 Q73 30 77 35 Q79 40 77 25;M75 50 Q77 30 73 35 Q71 40 73 25;M75 50 Q73 30 77 35 Q79 40 77 25" dur="3s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.2;0.7;0.2" dur="2s" repeatCount="indefinite" />
                      </path>
                      <path d="M100 45 Q98 25 102 30 Q104 35 102 20" stroke="#ec4899" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.7">
                        <animate attributeName="d" values="M100 45 Q98 25 102 30 Q104 35 102 20;M100 45 Q102 25 98 30 Q96 35 98 20;M100 45 Q98 25 102 30 Q104 35 102 20" dur="2.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.6;0.3;0.6" dur="3s" repeatCount="indefinite" />
                      </path>
                      <path d="M125 50 Q123 30 127 35 Q129 40 127 25" stroke="#a855f7" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.7">
                        <animate attributeName="d" values="M125 50 Q123 30 127 35 Q129 40 127 25;M125 50 Q127 30 123 35 Q121 40 123 25;M125 50 Q123 30 127 35 Q129 40 127 25" dur="3.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2.5s" repeatCount="indefinite" />
                      </path>
                    </>
                  )}
                </svg>
              </div>
              <div style={{ marginTop: '24px', textAlign: 'center' }}>
                <div style={{
                  fontSize: '56px',
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: '1'
                }}>
                  {Math.round(getCoffeeLevel())}%
                </div>
                <div style={{ fontSize: '16px', color: '#71717a', marginTop: '12px', fontWeight: '500' }}>Energy Level</div>
              </div>
            </div>
          )}

          {/* Hourglass - Premium 3D Design */}
          {visual === 'hourglass' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '180px', height: '260px' }}>
                <svg viewBox="0 0 180 260" style={{ width: '100%', height: '100%' }}>
                  <defs>
                    <linearGradient id="sandGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#fcd34d', stopOpacity: 1 }} />
                      <stop offset="50%" style={{ stopColor: '#fbbf24', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#f59e0b', stopOpacity: 1 }} />
                    </linearGradient>
                    <radialGradient id="glassShine">
                      <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 0.2 }} />
                      <stop offset="100%" style={{ stopColor: '#ffffff', stopOpacity: 0 }} />
                    </radialGradient>
                    <filter id="sandShadow">
                      <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
                      <feOffset dx="0" dy="1" result="offsetblur"/>
                      <feComponentTransfer>
                        <feFuncA type="linear" slope="0.4"/>
                      </feComponentTransfer>
                      <feMerge>
                        <feMergeNode/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  
                  {/* Wooden frame top - 3D effect */}
                  <rect x="25" y="15" width="130" height="18" rx="9" fill="#52525b" stroke="#71717a" strokeWidth="3"/>
                  <rect x="28" y="17" width="124" height="14" rx="7" fill="#3f3f46"/>
                  <rect x="30" y="18" width="120" height="10" rx="5" fill="#27272a"/>
                  
                  {/* Hourglass glass container */}
                  <path
                    d="M50 35 L130 35 L130 45 L95 130 L90 135 L85 130 L50 45 Z M85 125 L90 130 L95 125 L130 210 L130 220 L50 220 L50 210 Z"
                    fill="#18181b"
                    stroke="#71717a"
                    strokeWidth="4"
                    opacity="0.95"
                  />
                  
                  {/* Glass highlight */}
                  <ellipse cx="70" cy="80" rx="15" ry="30" fill="url(#glassShine)" opacity="0.4"/>
                  
                  {/* Top sand chamber */}
                  <clipPath id="topChamber">
                    <path d="M52 37 L128 37 L128 43 L95 128 L90 133 L85 128 L52 43 Z"/>
                  </clipPath>
                  
                  <path
                    d={`M55 40 L125 40 L${112 - (52 * (100 - getProgress()) / 100)} ${45 + (85 * (100 - getProgress()) / 100)} L${68 + (52 * (100 - getProgress()) / 100)} ${45 + (85 * (100 - getProgress()) / 100)} Z`}
                    fill="url(#sandGradient2)"
                    clipPath="url(#topChamber)"
                    style={{ transition: 'all 0.8s linear' }}
                    filter="url(#sandShadow)"
                  />
                  
                  {/* Bottom sand chamber */}
                  <clipPath id="bottomChamber">
                    <path d="M85 127 L90 132 L95 127 L128 218 L52 218 Z"/>
                  </clipPath>
                  
                  <path
                    d={`M${68 + (52 * (100 - getProgress()) / 100)} ${215 - (85 * getProgress() / 100)} L${112 - (52 * (100 - getProgress()) / 100)} ${215 - (85 * getProgress() / 100)} L125 215 L55 215 Z`}
                    fill="url(#sandGradient2)"
                    clipPath="url(#bottomChamber)"
                    style={{ transition: 'all 0.8s linear' }}
                    filter="url(#sandShadow)"
                  />
                  
                  {/* Falling sand stream */}
                  {isRunning && getProgress() < 99 && (
                    <>
                      <line x1="90" y1="130" x2="90" y2="150" stroke="#fbbf24" strokeWidth="3" opacity="0.9">
                        <animate attributeName="y2" from="130" to="150" dur="0.8s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.9;0.5;0.9" dur="0.8s" repeatCount="indefinite" />
                      </line>
                      {/* Sand particles */}
                      {[0, 1, 2, 3, 4].map((i) => (
                        <circle key={i} cx={88 + Math.random() * 4} cy="130" r="2" fill="#fcd34d" opacity="0.7">
                          <animate attributeName="cy" from="130" to={160 + Math.random() * 20} dur={1 + Math.random()}s repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0;0.8;0" dur={1 + Math.random()}s repeatCount="indefinite" />
                        </circle>
                      ))}
                    </>
                  )}
                  
                  {/* Wooden frame bottom - 3D effect */}
                  <rect x="25" y="227" width="130" height="18" rx="9" fill="#52525b" stroke="#71717a" strokeWidth="3"/>
                  <rect x="28" y="229" width="124" height="14" rx="7" fill="#3f3f46"/>
                  <rect x="30" y="230" width="120" height="10" rx="5" fill="#27272a"/>
                </svg>
              </div>
              <div style={{ marginTop: '24px', textAlign: 'center' }}>
                <div style={{
                  fontSize: '56px',
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: '1'
                }}>
                  {Math.round(getProgress())}%
                </div>
                <div style={{ fontSize: '16px', color: '#71717a', marginTop: '12px', fontWeight: '500' }}>
                  {isRunning ? 'Time Flowing' : 'Paused'}
                </div>
              </div>
            </div>
          )}

          {/* Music Player */}
          <MusicPlayer isTimerRunning={isRunning} />
        </div>
      </div>

      {/* Info Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginTop: '40px',
        maxWidth: '1000px',
        margin: '40px auto 0'
      }}>
        <InfoCard
          icon="🍅"
          title="Pomodoro Technique"
          description="Work-Break cycles: Work → Short Break → Repeat. After 4 cycles, get a Long Break. Fully customizable!"
        />
        <InfoCard
          icon="⏱️"
          title="Custom Timer"
          description="Continuous focus session with NO breaks. Set any duration (1-120 min) for uninterrupted deep work."
        />
        <InfoCard
          icon="🎵"
          title="Focus Music"
          description="Choose from Lofi, Rain Sounds, Ambient, Nature, or Classical music to enhance your concentration."
        />
        <InfoCard
          icon="📊"
          title="Auto Tracking"
          description="All your focus sessions are automatically logged and tracked in your activity dashboard."
        />
      </div>

      {/* Todo Selector Modal */}
      {showTodoSelector && (
        <div className="modal-overlay" onClick={() => setShowTodoSelector(false)}>
          <div className="modal" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: '#f4f4f5' }}>
              What are you working on?
            </h2>
            <p style={{ fontSize: '14px', color: '#a1a1aa', marginBottom: '24px' }}>
              Select a task to track your focus time, or start without selecting one
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', maxHeight: '400px', overflowY: 'auto' }}>
              {/* Option: No specific task */}
              <button
                onClick={() => confirmStartWithTodo(null)}
                className="btn"
                style={{
                  background: '#18181b',
                  border: '1px solid #27272a',
                  padding: '16px',
                  textAlign: 'left',
                  justifyContent: 'flex-start',
                  gap: '12px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3f3f46'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#27272a'}
              >
                <div style={{ fontSize: '24px' }}>💭</div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#f4f4f5' }}>
                    General Focus Session
                  </div>
                  <div style={{ fontSize: '13px', color: '#71717a' }}>
                    Not working on a specific task
                  </div>
                </div>
              </button>

              {/* List of todos */}
              {todos.map((todo) => {
                const goal = goals.find(g => g.id === todo.goal_id);
                return (
                  <button
                    key={todo.id}
                    onClick={() => confirmStartWithTodo(todo)}
                    className="btn"
                    style={{
                      background: '#18181b',
                      border: '1px solid #27272a',
                      padding: '16px',
                      textAlign: 'left',
                      justifyContent: 'flex-start',
                      gap: '12px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#8b5cf6';
                      e.currentTarget.style.background = '#1f1f23';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#27272a';
                      e.currentTarget.style.background = '#18181b';
                    }}
                  >
                    <div style={{ fontSize: '24px' }}>✅</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '15px', fontWeight: '600', color: '#f4f4f5', marginBottom: '4px' }}>
                        {todo.title}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#71717a' }}>
                        {goal && (
                          <>
                            <span>🎯 {goal.title}</span>
                            <span>•</span>
                          </>
                        )}
                        <span className="badge" style={{
                          background: todo.priority === 'high' ? '#dc262620' : todo.priority === 'medium' ? '#f59e0b20' : '#10b98120',
                          color: todo.priority === 'high' ? '#dc2626' : todo.priority === 'medium' ? '#f59e0b' : '#10b981',
                          padding: '2px 8px',
                          fontSize: '11px'
                        }}>
                          {todo.priority}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowTodoSelector(false)}
              className="btn btn-secondary"
              style={{ width: '100%' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes sandFall {
          0% { transform: translate(-50%, -50%) translateY(0); opacity: 1; }
          100% { transform: translate(-50%, -50%) translateY(20px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function InfoCard({ icon, title, description }) {
  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '40px', marginBottom: '12px' }}>{icon}</div>
      <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#f4f4f5', marginBottom: '8px' }}>
        {title}
      </h3>
      <p style={{ fontSize: '14px', color: '#a1a1aa', lineHeight: '1.6' }}>
        {description}
      </p>
    </div>
  );
}

