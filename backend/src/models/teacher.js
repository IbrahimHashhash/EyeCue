class Teacher {
  static tableName = 'teacher';

  constructor({ id, name, email, created_at }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.created_at = created_at;
  }
}

export default Teacher;