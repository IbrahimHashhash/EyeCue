class ClassModel {
  static tableName = 'class';

  constructor({ id, name, teacher_id, created_at }) {
    this.id = id;
    this.name = name;
    this.teacher_id = teacher_id;
    this.created_at = created_at;
  }
}

export default ClassModel;