import BaseRepository from "./baseRepository.js";
import Student from "../models/Student.js";

export default class StudentRepository extends BaseRepository {
    constructor(pool) {
        super(Student, pool);
    }

    async getByEmail(email) {
        const result = await this.pool
            .request()
            .input("email", email)
            .query(`SELECT TOP 1 * FROM ${Student.tableName} WHERE email = @email`);
        return result.recordset[0] || null;
    }

    async getByName(name) {
        const result = await this.pool
            .request()
            .input("name", name)
            .query(`SELECT TOP 1 * FROM ${Student.tableName} WHERE name = @name`);
        return result.recordset[0] || null;
    }
}