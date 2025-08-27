class SessionParticipant {
  static tableName = 'session_participant';

  constructor({ id, session_id, student_id }) {
    this.id = id;
    this.session_id = session_id;
    this.student_id = student_id;
  }
}

export default SessionParticipant;