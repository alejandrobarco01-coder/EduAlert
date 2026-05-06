import { calculateRiskIndex, getAllStudents } from './server/data/students.js';
import { CRITICAL_RISK_THRESHOLD } from './server/logic/rules.js';

console.log('--- Testing Critical Risk Rule ---');
console.log(`Threshold: ${CRITICAL_RISK_THRESHOLD}%`);

// Get all students (which trigger rule application)
const students = getAllStudents();

const criticalStudents = students.filter(s => s.riskIndex >= CRITICAL_RISK_THRESHOLD);

console.log(`Total students: ${students.length}`);
console.log(`Students with critical risk (>= ${CRITICAL_RISK_THRESHOLD}%): ${criticalStudents.length}`);

criticalStudents.forEach(s => {
  console.log(`\nStudent: ${s.name}`);
  console.log(`Risk Index: ${s.riskIndex}%`);
  console.log(`Risk Level: ${s.riskLevel}`);
  console.log(`Alerts: ${s.alerts.join(', ')}`);

  const hasTriggeredAction = s.alerts.some(a => a.includes('INTERVENCIÓN CRÍTICA'));
  console.log(`Triggered Action: ${hasTriggeredAction ? '✅ YES' : '❌ NO'}`);
});

if (criticalStudents.length === 0) {
  console.log('\nWarning: No students currently meet the critical risk threshold in mock data.');
  console.log('Testing with a manual student object...');

  const highRiskStudent = {
    id: 99,
    name: 'Test Student High Risk',
    gpa: 1.0,
    absences: 25,
    alerts: []
  };

  // We need to calculate risk for this manual student
  const risk = calculateRiskIndex(highRiskStudent);
  highRiskStudent.riskIndex = risk;

  // Import applyRules directly to test
  import('./server/logic/rules.js').then(({ applyRules }) => {
    const studentWithRules = applyRules(highRiskStudent);
    console.log(`\nManual Test Student: ${studentWithRules.name}`);
    console.log(`Risk Index: ${studentWithRules.riskIndex}%`);
    const hasTriggered = studentWithRules.alerts.some(a => a.includes('INTERVENCIÓN CRÍTICA'));
    console.log(`Triggered Action: ${hasTriggered ? '✅ YES' : '❌ NO'}`);
  });
}
