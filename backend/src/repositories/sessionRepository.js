import BaseRepository from "./baseRepository.js";
import SessionModel from "../models/session.js";

export default class SessionRepository extends BaseRepository {
  constructor(pool) {
    super(SessionModel, pool);
  }

  async listActive() {
    const result = await this.pool
      .request()
      .query(`SELECT * FROM ${SessionModel.tableName} WHERE active = 1`);
    return result.recordset;
  }

  async create(sessionData) {
    const result = await this.pool
      .request()
      .input('id', sessionData.id)                
      .input('class_id', sessionData.class_id)
      .input('start_time', sessionData.start_time)
      .input('end_time', sessionData.end_time ?? null)
      .input('active', sessionData.active)
      .query(
        `INSERT INTO ${SessionModel.tableName} 
          (id, class_id, start_time, end_time, active) 
         VALUES (@id, @class_id, @start_time, @end_time, @active);

         SELECT @id AS id;`                       
      );
    return result.recordset[0].id;
  }

  async update(sessionId, updateData) {
    const result = await this.pool
      .request()
      .input('id', sessionId)
      .input('end_time', updateData.end_time)
      .input('active', updateData.active)
      .query(
        `UPDATE ${SessionModel.tableName} SET end_time = @end_time, active = @active WHERE id = @id`
      );
    return result.rowsAffected[0] > 0;
  }

  async generateAttentionReport(sessionId) {
    const result = await this.pool
      .request()
      .input('session_id', sessionId)
      .query(`
        SELECT 
          s.name,
          COUNT(am.attention_score) as total_frames,
          SUM(CAST(am.attention_score AS INT)) as attentive_frames,
          CASE 
            WHEN COUNT(am.attention_score) > 0 
            THEN CAST(ROUND((SUM(CAST(am.attention_score AS INT)) * 100.0 / COUNT(am.attention_score)), 2) AS DECIMAL(5,2))
            ELSE 0 
          END as attention_percentage
        FROM frame_log fl
        INNER JOIN student s ON fl.student_id = s.id
        INNER JOIN attention_metric am ON fl.id = am.frame_log_id
        WHERE fl.session_id = @session_id
        GROUP BY s.id, s.name
        ORDER BY attention_percentage DESC
      `);
    return result.recordset;
  }
}