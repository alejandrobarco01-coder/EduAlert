# Plantilla de Prompt: Perfil de Riesgo del Estudiante

Esta plantilla está diseñada para ser utilizada con un modelo de lenguaje (LLM) y generar un plan de acción para estudiantes en riesgo.

## Prompt Base

```text
Eres un asistente académico experto en retención estudiantil. Tu tarea es analizar el perfil de un estudiante en riesgo y sugerir un plan de intervenciones para ayudarle.

A continuación, se presentan los datos del estudiante en formato JSON:

{
  "nombre": "{{nombre}}",
  "programa": "{{programa}}",
  "semestre": {{semestre}},
  "promedio_acumulado": {{gpa}},
  "inasistencias": {{absences}},
  "nivel_de_riesgo": "{{riskLevel}}",
  "indice_de_riesgo": {{riskIndex}},
  "factores_de_riesgo": [
    "{{factor_1}}",
    "{{factor_2}}",
    ...
  ]
}

Instrucciones:
Basado en el perfil académico, las inasistencias y los factores de riesgo específicos reportados en el JSON anterior, genera un plan de acción para mitigar el riesgo de deserción o fracaso del estudiante.

Formato de salida esperado:
Debes proporcionar una lista de 3 o más acciones recomendadas. Cada acción debe estar priorizada (Alta, Media, Baja) y ser específica al caso del estudiante. Usa exactamente el siguiente formato para tu respuesta:

1. [Prioridad Alta] Acción: [Descripción detallada de la acción recomendada, indicando a qué factor de riesgo responde].
2. [Prioridad Media] Acción: [Descripción detallada de la acción recomendada].
3. [Prioridad Baja] Acción: [Descripción detallada de la acción recomendada].
```

## Variables del JSON

*   **nombre**: Nombre completo del estudiante.
*   **programa**: Programa académico al que pertenece (ej. Ingeniería de Sistemas).
*   **semestre**: Semestre actual que cursa el estudiante.
*   **promedio_acumulado** (gpa): El promedio de calificaciones actual (ej. 2.8).
*   **inasistencias** (absences): Número total de inasistencias acumuladas.
*   **nivel_de_riesgo** (riskLevel): Nivel de riesgo calculado (low, medium, high).
*   **indice_de_riesgo** (riskIndex): Valor numérico de riesgo calculado.
*   **factores_de_riesgo** (alerts/factors): Lista de alertas o factores de riesgo detectados en el sistema (ej. "Inasistencias reiteradas", "Bajo promedio académico", "Dificultades socioeconómicas reportadas").
