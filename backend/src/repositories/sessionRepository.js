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
      .input('class_id', sessionData.class_id)
      .input('start_time', sessionData.start_time)
      .input('end_time',null )
      .input('active', sessionData.active) 
      .query(
        `INSERT INTO ${SessionModel.tableName} (class_id, start_time, end_time, active) VALUES (@class_id, @start_time, @end_time, @active); SELECT SCOPE_IDENTITY() AS id;`
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
}