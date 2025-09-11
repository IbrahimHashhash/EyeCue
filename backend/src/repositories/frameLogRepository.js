import BaseRepository from "./baseRepository.js";
import FrameLog from "../models/frameLog.js";

export default class FrameLogRepository extends BaseRepository {
  constructor(pool) {
    super(FrameLog, pool);
  }

  async recentForStudent(session_id, student_id, limit = 100) {
    const result = await this.pool
      .request()
      .input("session_id", session_id)
      .input("student_id", student_id)
      .input("limit", limit)
      .query(`
                SELECT TOP (@limit) * FROM ${FrameLog.tableName}
                WHERE session_id = @session_id AND student_id = @student_id
                ORDER BY timestamp DESC
            `);
    return result.recordset;
  }
  async create(entry) {

    const result = await this.pool
      .request()
      .input("id", entry.id)
      .input("session_id", entry.session_id)
      .input("student_id", entry.student_id)
      .input("timestamp", entry.timestamp)
      .input("similarity_score", entry.similarity_score)
      .input("is_significant", entry.is_significant)
      .query(`
      INSERT INTO ${FrameLog.tableName}
        (id, session_id, student_id, [timestamp], similarity_score, is_significant)
      OUTPUT INSERTED.*
      VALUES (@id, @session_id, @student_id, @timestamp, @similarity_score, @is_significant)
      `);
      console.log(result.recordset[0]);
    return result.recordset[0].id;
  }

}