export class SessionService {
  constructor(uow) {
    this.activeSessions = new Map();
    this.uow = uow;
  }

  async startSession() {
    if (!this.uow?.sessions) throw new Error("UnitOfWork not initialized");
    const classId = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

    const sessionId = await this.uow.sessions.create({
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

    this.activeSessions.set(sessionId, sessionData);

    return sessionId;
  }

  async endSession(sessionId) {
    if (!this.uow?.sessions) throw new Error("UnitOfWork not initialized");
    const session = this.activeSessions.get(sessionId);

    if (!session) {
      throw new Error('Session not found');
    }

    if (!session.active) {
      throw new Error('Session is already ended');
    }

    end_time = new Date().toISOString();
    session.endTime = end_time;
    session.active = false;

    const ok = await this.uow.sessions.update(sessionId, {
      end_time: end_time,
      active: 0
    });
    if (!ok) throw new Error("Session not found or already ended");

    return session;
  }

  getActiveSession(sessionId) {
    return this.activeSessions.get(sessionId);
  }

  getAllActiveSessions() {
    return Array.from(this.activeSessions.values()).filter(session => session.active);
  }
}