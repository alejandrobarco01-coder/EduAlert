import { addStudent, getAllStudents, getRiskHistory } from '../server/data/students.js';

try {
  console.log('Testing addStudent...');
  const newStudent = addStudent({
    name: 'Test Student',
    studentCode: '12345',
    email: 'test@uceva.edu.co',
    faculty: 'Ingeniería',
    program: 'Sistemas',
    semester: 1,
    gpa: 4.5,
    absences: 2
  });
  console.log('Student added:', newStudent);

  console.log('Testing getAllStudents...');
  const all = getAllStudents();
  console.log('Count:', all.length);

  console.log('Testing getRiskHistory...');
  const history = getRiskHistory(6);
  console.log('History length:', history.length);
} catch (err) {
  console.error('CRASH DETECTED:', err);
}
