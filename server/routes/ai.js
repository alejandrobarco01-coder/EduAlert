import express from 'express';
import { getStudentById } from '../data/students.js';
import { getFactorsForStudent } from '../data/studentFactors.js';
import { getAllFactors } from '../data/factors.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/recommendations', async (req, res) => {
  const { studentId } = req.body;

  if (!studentId) {
    return res.status(400).json({ success: false, message: 'studentId es requerido' });
  }

  const student = getStudentById(Number(studentId));
  if (!student) {
    return res.status(404).json({ success: false, message: 'Estudiante no encontrado' });
  }

  try {
    const factorIds = getFactorsForStudent(Number(studentId)) || [];
    const allFactors = getAllFactors() || [];
    const studentFactors = allFactors.filter(f => factorIds.includes(f.id)).map(f => f.name);

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY no configurada');
    }

    const prompt = `
      Eres un asesor académico experto. Necesito recomendaciones de intervención para un estudiante universitario.
      
      Datos del estudiante:
      Nombre: ${student.name}
      Programa: ${student.program}
      Semestre: ${student.semester}
      Promedio (GPA): ${student.gpa}
      Faltas: ${student.absences}
      Nivel de Riesgo: ${student.riskLevel}
      
      Factores de riesgo detectados:
      ${studentFactors.length > 0 ? studentFactors.join(', ') : 'Ninguno'}
      
      Proporciona un arreglo JSON válido con 3 recomendaciones de intervención. 
      Cada recomendación debe tener la estructura:
      {
        "id": "identificador único corto (ej: ai-rec-1)",
        "icon": "nombre de un icono de LucideReact (ej: BookOpen, AlertTriangle, PhoneCall, etc)",
        "text": "texto detallado de la recomendación",
        "priority": "high" o "medium" o "low"
      }
      
      Retorna ÚNICAMENTE el arreglo JSON. Nada de texto antes o después.
    `;

    // Timeout de 8 segundos para asegurar respuesta < 10s
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!aiResponse.ok) {
      throw new Error(`API AI respondió con status ${aiResponse.status}`);
    }

    const data = await aiResponse.json();
    const rawContent = data.choices[0].message.content;
    
    const jsonMatch = rawContent.match(/\[.*\]/s);
    const parsedRecommendations = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(rawContent);

    res.json({
      success: true,
      data: parsedRecommendations
    });

  } catch (error) {
    console.error('Error en API IA:', error.message);
    res.status(502).json({
      success: false,
      message: 'Error de comunicación con el servicio de IA'
    });
  }
});

export default router;
