/**
 * EduAlert Notification Service
 *
 * Handles sending alerts via mock Email and Webhooks.
 * Includes dynamic email template builder (SCRUM-53).
 */

import { appendFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { addNotificationEntry } from '../data/notifications.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOG_DIR = join(__dirname, '..', 'logs');
const NOTIF_LOG = join(LOG_DIR, 'notifications.log');

// Ensure log directory exists to avoid crashes on appendFile
import { mkdirSync } from 'node:fs';
try {
  mkdirSync(LOG_DIR, { recursive: true });
} catch (err) {
  // Directory already exists or cannot be created (log the error but don't crash)
}

// ─── Risk level labels ────────────────────────────────────────────────────────
const RISK_LEVEL_LABELS = {
  unevaluated: 'SIN EVALUAR',
  critical: 'CRÍTICO',
  high: 'ALTO',
  medium: 'MODERADO',
  low: 'BAJO',
};

const RISK_LEVEL_COLORS = {
  unevaluated: '#9ca3af',
  critical: '#dc2626',
  high: '#ea580c',
  medium: '#d97706',
  low: '#16a34a',
};

/**
 * Builds a dynamic email body for a student alert.
 * Acceptance criteria (SCRUM-53):
 *  - Includes student name                ✅
 *  - Includes risk value (0–100)          ✅
 *  - Includes relevant active factors     ✅
 *  - Content generated dynamically        ✅
 *
 * @param {object} student  — Student record (name, email, riskIndex, riskLevel, program, semester)
 * @param {Array}  factors  — Array of active risk factor objects { name, weight, description }
 * @returns {{ subject: string, text: string, html: string }}
 */
export function buildEmailTemplate(student, factors = []) {
  const riskLabel = RISK_LEVEL_LABELS[student.riskLevel] || 'DESCONOCIDO';
  const riskColor = RISK_LEVEL_COLORS[student.riskLevel] || '#6b7280';
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-CO', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  const timeStr = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

  // ── Subject ──────────────────────────────────────────────────────────────
  const subject = `⚠️ Alerta EduAlert: ${student.name} — Riesgo ${riskLabel} (${student.riskIndex}/100)`;

  // ── Plain-text version ───────────────────────────────────────────────────
  const factorsText = factors.length > 0
    ? factors.map((f, i) => `  ${i + 1}. ${f.name}${f.description ? ` — ${f.description}` : ''}`).join('\n')
    : '  (Sin factores de riesgo adicionales registrados)';

  const text = `
EduAlert — Sistema de Alerta Temprana Estudiantil
Universidad Central del Valle (UCEVA)
Generado: ${dateStr} a las ${timeStr}

─────────────────────────────────────
NOTIFICACIÓN DE RIESGO ESTUDIANTIL
─────────────────────────────────────

Estimado equipo de Bienestar,

El sistema ha detectado un nivel de riesgo ${riskLabel} para el siguiente estudiante:

  Nombre:    ${student.name}
  Programa:  ${student.program}
  Semestre:  ${student.semester}
  Correo:    ${student.email}

ÍNDICE DE RIESGO: ${student.riskIndex} / 100  [${riskLabel}]

FACTORES DE RIESGO ACTIVOS (${factors.length}):
${factorsText}

Se recomienda tomar acción de seguimiento de manera oportuna.

─────────────────────────────────────
Este correo fue generado automáticamente por EduAlert.
No responder directamente a este mensaje.
`.trim();

  // ── HTML version ─────────────────────────────────────────────────────────
  const factorsHtml = factors.length > 0
    ? factors.map(f => `
        <li style="margin-bottom:8px; padding:10px 14px; background:#1f2937; border-left:3px solid ${riskColor}; border-radius:6px;">
          <strong style="color:#f9fafb;">${f.name}</strong>
          ${f.description ? `<span style="color:#9ca3af; font-size:13px;"> — ${f.description}</span>` : ''}
        </li>`).join('')
    : `<li style="color:#6b7280; font-style:italic; padding:8px;">Sin factores adicionales registrados.</li>`;

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Alerta EduAlert — ${student.name}</title>
</head>
<body style="margin:0;padding:0;background:#030712;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#030712;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="620" cellpadding="0" cellspacing="0" style="background:#111827;border-radius:16px;overflow:hidden;border:1px solid #1f2937;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#7f1d1d,#1e1b4b);padding:32px 40px;text-align:center;">
              <div style="font-size:28px;font-weight:900;color:#fff;letter-spacing:-0.5px;">⚠️ EduAlert</div>
              <div style="font-size:12px;color:#a5b4fc;letter-spacing:3px;text-transform:uppercase;margin-top:4px;">Sistema de Alerta Temprana · UCEVA</div>
            </td>
          </tr>

          <!-- Risk badge -->
          <tr>
            <td style="padding:32px 40px 0;">
              <div style="display:inline-block;background:${riskColor}22;border:1px solid ${riskColor}55;border-radius:8px;padding:6px 16px;margin-bottom:20px;">
                <span style="color:${riskColor};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;">Nivel de Riesgo: ${riskLabel}</span>
              </div>
              <h2 style="margin:0 0 4px;color:#f9fafb;font-size:22px;font-weight:800;">Notificación de Riesgo Estudiantil</h2>
              <p style="margin:0;color:#6b7280;font-size:13px;">${dateStr} · ${timeStr}</p>
            </td>
          </tr>

          <!-- Student info -->
          <tr>
            <td style="padding:24px 40px;">
              <div style="background:#1f2937;border-radius:12px;padding:20px 24px;border:1px solid #374151;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="56" valign="middle">
                      <div style="width:48px;height:48px;background:linear-gradient(135deg,#ca0034,#7c0020);border-radius:12px;display:flex;align-items:center;justify-content:center;font-weight:900;color:#fff;font-size:18px;text-align:center;line-height:48px;">
                        ${student.avatar || student.name.charAt(0).toUpperCase()}
                      </div>
                    </td>
                    <td style="padding-left:16px;">
                      <div style="color:#f9fafb;font-size:17px;font-weight:700;">${student.name}</div>
                      <div style="color:#9ca3af;font-size:13px;margin-top:2px;">${student.program} · Semestre ${student.semester}</div>
                      <div style="color:#6b7280;font-size:12px;margin-top:2px;">${student.email}</div>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Risk index meter -->
          <tr>
            <td style="padding:0 40px 24px;">
              <div style="background:#1f2937;border-radius:12px;padding:20px 24px;border:1px solid #374151;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                  <span style="color:#9ca3af;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;">Índice de Riesgo</span>
                  <span style="color:${riskColor};font-size:28px;font-weight:900;">${student.riskIndex}<span style="font-size:14px;color:#6b7280;">/100</span></span>
                </div>
                <div style="background:#374151;border-radius:99px;height:8px;overflow:hidden;">
                  <div style="width:${student.riskIndex}%;height:100%;background:linear-gradient(90deg,${riskColor}99,${riskColor});border-radius:99px;"></div>
                </div>
                <div style="display:flex;justify-content:space-between;margin-top:6px;">
                  <span style="font-size:10px;color:#4b5563;">0 — Bajo</span>
                  <span style="font-size:10px;color:#4b5563;">100 — Crítico</span>
                </div>
              </div>
            </td>
          </tr>

          <!-- Active factors -->
          <tr>
            <td style="padding:0 40px 24px;">
              <div style="color:#9ca3af;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:12px;">
                Factores de Riesgo Activos (${factors.length})
              </div>
              <ul style="margin:0;padding:0;list-style:none;">
                ${factorsHtml}
              </ul>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 40px 32px;">
              <div style="background:#0f172a;border:1px dashed #374151;border-radius:12px;padding:16px 20px;text-align:center;">
                <p style="color:#9ca3af;font-size:13px;margin:0 0 4px;">Se recomienda tomar acción de seguimiento de manera oportuna.</p>
                <p style="color:#4b5563;font-size:11px;margin:0;">Este correo fue generado automáticamente por EduAlert · No responder.</p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#0f172a;padding:16px 40px;text-align:center;border-top:1px solid #1f2937;">
              <p style="color:#374151;font-size:11px;margin:0;">© ${now.getFullYear()} EduAlert · Universidad Central del Valle · Bienestar Universitario</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

  return { subject, text, html };
}

/**
 * Sends a notification email to a student using the dynamic template.
 * @param {object} student  — Full student record
 * @param {Array}  factors  — Active risk factors array
 */
export async function sendNotification(student, factors = []) {
  const { subject, text, html } = buildEmailTemplate(student, factors);
  const timestamp = new Date().toLocaleString();
  const emailLog = `[EMAIL @ ${timestamp}] TO: ${student.email} | SUBJECT: ${subject}\n`;

  console.log(`\n📧 Sending Email to ${student.email}...`);
  console.log(`📋 Subject: ${subject}`);

  try {
    // 1. Simular envío de Correo (Log)
    await appendFile(NOTIF_LOG, emailLog);
    await addNotificationEntry({
      studentId: student.id,
      studentName: student.name,
      recipient: student.email,
      type: 'email',
      status: 'success',
      message: text,
      subject,
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
          riskLevel: student.riskLevel,
          factors: factors.map(f => f.name),
          timestamp,
          subject,
        })
      });

      const status = response.ok ? 'success' : 'failed';
      await addNotificationEntry({
        studentId: student.id,
        studentName: student.name,
        recipient: webhookUrl,
        type: 'webhook',
        status,
        message: text,
        subject,
      });

      if (response.ok) {
        console.log('✅ Webhook triggered successfully.');
      } else {
        console.warn('⚠️ Webhook failed with status:', response.status);
      }
    } else {
      console.log('ℹ️ No Webhook URL configured (skipping).');
    }

    return { success: true, timestamp, subject };
  } catch (error) {
    console.error('❌ Notification Error:', error.message);
    return { success: false, error: error.message };
  }
}
