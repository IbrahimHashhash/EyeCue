import BaseRepository from "./baseRepository.js";
import ClassModel from "../models/classModel.js";

export default class ClassRepository extends BaseRepository {
  constructor(pool) {
    super(ClassModel, pool);
  }

  async listByTeacher(teacher_id) {
    const result = await this.pool
      .request()
      .input("teacher_id", teacher_id)
      .query(`SELECT * FROM ${ClassModel.tableName} WHERE teacher_id = @teacher_id`);
    return result.recordset;
  }
}