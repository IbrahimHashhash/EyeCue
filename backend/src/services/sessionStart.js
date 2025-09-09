export class SessionService {
  constructor() {
    this.activeSessions = new Map();
  }

  async startSession() {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const sessionData = {
      id: sessionId,
      startTime: new Date().toISOString(),
      endTime: null,
      active: true,
      students: new Map()
    };
    
    this.activeSessions.set(sessionId, sessionData);
    
    return sessionId;
  }

  async endSession(sessionId) {
    const session = this.activeSessions.get(sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }

    if (!session.active) {
      throw new Error('Session is already ended');
    }

    session.endTime = new Date().toISOString();
    session.active = false;    
    return session;
  }

  getActiveSession(sessionId) {
    return this.activeSessions.get(sessionId);
  }

  getAllActiveSessions() {
    return Array.from(this.activeSessions.values()).filter(session => session.active);
  }
}