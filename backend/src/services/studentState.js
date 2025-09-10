const students = {}

export function updateStudent(studentId, label) {
    students[studentId] = label
};

export function getStudent(studentId){
    return students[studentId];
};

export function getAllStudents() {
  return Object.values(students);
};