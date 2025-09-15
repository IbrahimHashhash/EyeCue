import { useState, useEffect } from 'react';
import { sessionService } from '../../services/session.js';
import {STORAGE_KEY} from '../../config/constants.js';

const SessionControl = ({ onSessionStart, onSessionEnd }) => {
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const validateStoredSession = async () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && saved !== 'null' && saved !== 'undefined') {
        try {
          console.log('Found stored session ID:', saved);
          localStorage.removeItem(STORAGE_KEY);
          console.log('Cleared stored session ID to start fresh');
        } catch (err) {
          console.log('Invalid stored session, clearing:', err);
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    };
    validateStoredSession();
  }, []);

  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem(STORAGE_KEY, currentSessionId);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [currentSessionId]);

  const handleStartSession = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { sessionId } = await sessionService.startSession();
      setCurrentSessionId(sessionId);
      onSessionStart?.(sessionId);
    } catch (err) {
      setError(err.message);
      console.error('Failed to start session:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (!currentSessionId) return;
    setIsLoading(true);
    setError(null);
    try {
      await sessionService.endSession(currentSessionId);
      onSessionEnd?.(currentSessionId);
      setCurrentSessionId(null);         
    } catch (err) {
      setError(err.message);
      console.error('Failed to end session:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="session-control">
      <button
        onClick={currentSessionId ? handleEndSession : handleStartSession}
        disabled={isLoading}
        className={`session-btn ${currentSessionId ? 'session-active' : 'session-inactive'}`}
      >
        {isLoading ? '...' : (currentSessionId ? 'End Session' : 'Start Session')}
      </button>
      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default SessionControl;