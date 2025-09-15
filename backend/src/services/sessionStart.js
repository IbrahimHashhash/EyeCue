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
    console.log('Session not found in active sessions, checking database...');
    const dbSession = await this.uow.sessions.findById(sessionId);
    if (!dbSession) {
      throw new Error(`Session not found: ${sessionId}`);
    }
    session = dbSession;
    console.log('Session found in database:', session);
  }
  
  const reportData = await this.uow.sessions.generateAttentionReport(sessionId);
  
  console.log('Report data retrieved:', reportData);
  console.log('Number of students found:', reportData ? reportData.length : 0);
  
  if (!reportData || reportData.length === 0) {
    console.log('No report data found, checking for attention records...');
        try {
      const attentionCount = await this.uow.attention?.countBySessionId?.(sessionId);
      console.log(`Found ${attentionCount || 0} attention records for session ${sessionId}`);
      
      if (attentionCount === 0) {
        console.log('No attention data was recorded for this session');
      }
    } catch (err) {
      console.log('Could not check attention records:', err.message);
    }
  }
  
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
  async findById(sessionId) {
  const result = await this.pool
    .request()
    .input('id', sessionId)
    .query(`SELECT * FROM ${SessionModel.tableName} WHERE id = @id`);
  return result.recordset[0] || null;
}
}
