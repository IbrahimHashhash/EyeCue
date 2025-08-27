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
}