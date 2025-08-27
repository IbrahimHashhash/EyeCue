class Student {
  static tableName = 'student';

  constructor({ id, name, email, created_at }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.created_at = created_at;
  }
}

export default Student;