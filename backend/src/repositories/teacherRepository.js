import BaseRepository from "./baseRepository.js";
import Teacher from "../models/teacher.js";

export default class TeacherRepository extends BaseRepository {
    constructor(pool) {
        super(Teacher, pool);
    }

    async getByEmail(email) {
        const result = await this.pool
            .request()
            .input("email", email)
            .query(`SELECT TOP 1 * FROM ${Teacher.tableName} WHERE email = @email`);
        return result.recordset[0] || null;
    }

    async getByName(name) {
        const result = await this.pool
            .request()
            .input("name", name)
            .query(`SELECT TOP 1 * FROM ${Teacher.tableName} WHERE name = @name`);
        return result.recordset[0] || null;
    }
}