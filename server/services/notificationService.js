/**
 * EduAlert Notification Service
 * 
 * Handles sending alerts via mock Email and Webhooks.
 */

import { appendFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { addNotificationEntry } from '../data/notifications.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOG_DIR = join(__dirname, '..', 'logs');
const NOTIF_LOG = join(LOG_DIR, 'notifications.log');

// Ensure logs directory exists (simulated by tool calling if needed)
// For now, we'll just try to append.

export async function sendNotification(student, message) {
  const timestamp = new Date().toLocaleString();
  const emailLog = `[EMAIL @ ${timestamp}] TO: ${student.email} | MSG: ${message}\n`;
  
  console.log(`\n📧 Sending Email to ${student.email}...`);
  console.log(`💬 Message: ${message}`);

  try {
    // 1. Simular envío de Correo (Log)
    await appendFile(NOTIF_LOG, emailLog);
    await addNotificationEntry({
      studentId: student.id,
      studentName: student.name,
      recipient: student.email,
      type: 'email',
      status: 'success',
      message
    });
    console.log(`✅ Email logged to ${NOTIF_LOG}`);

    // 2. Simular/Intentar Webhook (si está configurado)
    const webhookUrl = process.env.WEBHOOK_URL;
    if (webhookUrl) {
      console.log(`🔗 Triggering Webhook: ${webhookUrl}`);
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'CRITICAL_RISK_DETECTED',
          studentId: student.id,
          studentName: student.name,
          riskIndex: student.riskIndex,
          timestamp,
          message
        })
      });
      
      const status = response.ok ? 'success' : 'failed';
      await addNotificationEntry({
        studentId: student.id,
        studentName: student.name,
        recipient: webhookUrl,
        type: 'webhook',
        status,
        message
      });

      if (response.ok) {
        console.log('✅ Webhook triggered successfully.');
      } else {
        console.warn('⚠️ Webhook failed with status:', response.status);
      }
    } else {
      console.log('ℹ️ No Webhook URL configured (skipping).');
    }

    return { success: true, timestamp };
  } catch (error) {
    console.error('❌ Notification Error:', error.message);
    return { success: false, error: error.message };
  }
}
