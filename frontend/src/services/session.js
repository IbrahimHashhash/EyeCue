import ENDPOINTS from '../api/endpoints.js';

export const sessionService = {
  async startSession() {
    const response = await fetch(ENDPOINTS.SESSION.START, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to start session');
    }
    
    return await response.json();
  },

  async endSession(sessionId) {
    const response = await fetch(ENDPOINTS.SESSION.END, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to end session');
    }
    
    return await response.json();
  },
};