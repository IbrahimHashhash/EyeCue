class FrameLog {
  static tableName = 'frame_log';

  constructor({ id, session_id, student_id, timestamp, similarity_score, is_significant }) {
    this.id = id;
    this.session_id = session_id;
    this.student_id = student_id;
    this.timestamp = timestamp;
    this.similarity_score = similarity_score;
    this.is_significant = is_significant;
  }
}

export default FrameLog;