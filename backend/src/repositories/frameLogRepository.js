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
}