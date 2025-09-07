import BaseRepository from "./baseRepository.js";
import SessionParticipant from "../models/sessionParticipant.js";

export default class SessionParticipantRepository extends BaseRepository {
  constructor(pool) {
    super(SessionParticipant, pool);
  }

  async listStudentsBySession(session_id) {
    const result = await this.pool
      .request()
      .input('session_id', session_id)
      .query(`
        SELECT s.id, s.name
        FROM session_participant sp
        INNER JOIN Student s ON s.id = sp.student_id
        WHERE sp.session_id = @session_id
      `);
    return result.recordset;
  }
}