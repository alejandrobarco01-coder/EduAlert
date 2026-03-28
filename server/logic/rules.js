import { sendNotification } from '../services/notificationService.js';

export const CRITICAL_RISK_THRESHOLD = 70;

const rules = [
  {
    id: 'critical-risk-alert',
    name: 'Alerta de Riesgo Crítico',
    condition: (student) => student.riskIndex >= CRITICAL_RISK_THRESHOLD,
    action: (student) => {
      const alertMsg = '⚠️ INTERVENCIÓN CRÍTICA: Riesgo ≥ 70%. Protocolo de retención activado.';
      if (!student.alerts.includes(alertMsg)) {
        student.alerts.push(alertMsg);
        student.requiresImmediateAction = true;
        
        // Trigger notification
        sendNotification(student, alertMsg).then(res => {
          if (res.success) {
            console.log(`[NOTIF SENT] Email simulation for student ${student.id} completed.`);
          }
        });

        console.log(`[RULE TRIGGERED] Critical Risk for student ${student.id}: ${student.name}`);
      }
    }
  }
];

/**
 * Apply all active rules to a student object.
 * Modifies the student object in-place.
 */
export function applyRules(student) {
  rules.forEach(rule => {
    if (rule.condition(student)) {
      rule.action(student);
    }
  });
  return student;
}
