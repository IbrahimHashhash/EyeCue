import { useState } from 'react';
import { sessionService } from '../../services/session.js';

const SessionControl = ({ onSessionStart, onSessionEnd }) => {
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleStartSession = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await sessionService.startSession();
      setCurrentSessionId(response.sessionId);
      onSessionStart?.(response.sessionId);
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
    </div>
  );
};

export default SessionControl;