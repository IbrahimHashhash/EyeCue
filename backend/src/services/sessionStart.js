import { v4 as uuidv4 } from 'uuid';

const ACTIVE_SESSIONS = new Map();

export class SessionService {
  constructor(uow) {
    this.activeSessions = ACTIVE_SESSIONS;
    this.uow = uow;
  }

  async startSession() {
    if (!this.uow?.sessions) throw new Error("UnitOfWork not initialized");
    const classId = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

    const sessionId = uuidv4();  
    await this.uow.sessions.create({
      id: sessionId,
      class_id: classId ?? null,
      start_time: new Date().toISOString(),
      end_time: null,
      active: 1
    });

    const sessionData = {
      id: sessionId,
      startTime: new Date().toISOString(),
      endTime: null,
      active: true,
      students: new Map()
    };

    this.activeSessions.set(sessionId , sessionData);
    console.log("Active Sessions:", this.activeSessions);
    return sessionId;
  }

  async endSession(sessionId) {
    if (!this.uow?.sessions) throw new Error("UnitOfWork not initialized");
    console.log("Active Sessions:", this.activeSessions);
    const session = this.activeSessions.get(sessionId);

    if (!session) {
      throw new Error('Session not found');
    }

    if (!session.active) {
      throw new Error('Session is already ended');
    }

    const end_time = new Date().toISOString();
    session.endTime = end_time;
    session.active = false;

    const ok = await this.uow.sessions.update(sessionId, {
      end_time: end_time,
      active: 0
    });
    if (!ok) throw new Error("Session not found or already ended");

    return session;
  }

async generateReport(sessionId) {
  if (!this.uow?.sessions) throw new Error("UnitOfWork not initialized");
  
  console.log('Generating report for session ID:', sessionId);
  
  let session = this.activeSessions.get(sessionId);
  
  if (!session) {
    const dbSession = await this.uow.sessions.findById(sessionId);
    if (!dbSession) {
      throw new Error(`Session not found: ${sessionId}`);
    }
    session = dbSession;
  }
  
  const reportData = await this.uow.sessions.generateAttentionReport(sessionId);
  
  console.log('Report data retrieved:', reportData);
  
  return {
    sessionId,
    generatedAt: new Date().toISOString(),
    students: reportData || []
  };
}


  getActiveSession(sessionId) {
    return this.activeSessions.get(sessionId);
  }

  getCurrentActiveSessionId() {
    const activeSessions = this.getAllActiveSessions();
    return activeSessions.length > 0 ? activeSessions[0].id : null;
  }

  getAllActiveSessions() {
    return Array.from(this.activeSessions.values()).filter(session => session.active);
  }
}