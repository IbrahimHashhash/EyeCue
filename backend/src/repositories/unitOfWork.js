import { getConnection } from "../services/db.js";
import TeacherRepository from "./teacherRepository.js";
import ClassRepository from "./classRepository.js";
import FrameLogRepository from "./frameLogRepository.js";
import SessionRepository from "./sessionRepository.js";
import AttentionMetricRepository from "./attentionMetricRepository.js";
import StudentRepository from "./studentRepository.js";

export default class UnitOfWork {
  constructor() {
    this.pool = null;
  }

  async start() {
    this.pool = await getConnection();
    this.teachers = new TeacherRepository(this.pool);
    this.classes = new ClassRepository(this.pool);
    this.frameLogs = new FrameLogRepository(this.pool);
    this.sessions = new SessionRepository(this.pool);
    this.attentionMetrics = new AttentionMetricRepository(this.pool);
    this.students = new StudentRepository(this.pool);
  }
}