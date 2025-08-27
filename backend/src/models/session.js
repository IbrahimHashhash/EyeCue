class SessionModel {
  static tableName = 'session';

  constructor({ id, class_id, start_time, end_time, active }) {
    this.id = id;
    this.class_id = class_id;
    this.start_time = start_time;
    this.end_time = end_time;
    this.active = active;
  }
}

export default SessionModel;