# Manual de Usuario - Sistema EduAlert

## Introducción al Sistema EduAlert

**EduAlert** es una plataforma tecnológica integral diseñada para la detección temprana, prevención y seguimiento continuo del riesgo de deserción estudiantil. Su propósito principal es dotar a las instituciones educativas de herramientas avanzadas basadas en análisis de datos e inteligencia artificial, permitiendo identificar de forma proactiva a estudiantes en situación de vulnerabilidad académica, económica o psicosocial. Al centralizar la información y facilitar la gestión de intervenciones, EduAlert busca mejorar significativamente las tasas de retención, promoviendo el bienestar integral y el éxito académico de la comunidad estudiantil.

---

## Índice
1. [Roles y Permisos de Usuario](#1-roles-y-permisos-de-usuario)
2. [Acceso al Sistema](#2-acceso-al-sistema)
3. [Panel de Control Principal (Dashboard)](#3-panel-de-control-principal-dashboard)
4. [Módulo de Análisis y Reportes](#4-módulo-de-análisis-y-reportes)
5. [Gestión de Estudiantes: Creación y Seguimiento](#5-gestión-de-estudiantes-creación-y-seguimiento)
6. [Gestión de Usuarios y Roles](#6-gestión-de-usuarios-y-roles)

---

## 1. Roles y Permisos de Usuario

El sistema EduAlert está diseñado para ser operado por diferentes actores dentro de la comunidad educativa. Cada rol cuenta con un conjunto específico de permisos y accesos para garantizar la seguridad de la información y enfocar las herramientas según las responsabilidades de cada usuario.

### Administrador
El **Administrador** es el usuario con el nivel de acceso más alto en la plataforma, encargado de la configuración global y supervisión del sistema.
- **Permisos:** Acceso total a todos los módulos internos.
- **Responsabilidades:** 
  - Gestión integral de usuarios (creación, edición, eliminación y asignación de roles).
  - Acceso irrestricto al módulo de análisis y reportes estadísticos a nivel institucional.
  - Configuración de parámetros globales y reglas del motor de riesgo.
  - Supervisión general del estado de las alertas e intervenciones.

### Docente (Tutor)
El **Docente** o Tutor es el actor principal en el seguimiento directo del estudiante. Su enfoque está en el monitoreo del rendimiento académico y la ejecución de intervenciones tempranas.
- **Permisos:** Acceso limitado a los estudiantes asignados a su cargo, programa o facultad.
- **Responsabilidades:**
  - Registro de nuevos estudiantes y actualización de sus perfiles en el sistema.
  - Identificación y registro de factores de riesgo (rendimiento, asistencia, problemas socioeconómicos).
  - Registro y seguimiento de intervenciones, tutorías y observaciones en el historial del estudiante.
  - Consulta de recomendaciones generadas por la IA para la toma de decisiones.

### Estudiante
El **Estudiante** interactúa con el sistema de manera autogestionada, con el fin de proporcionar la información base para la evaluación de riesgo.
- **Permisos:** Acceso exclusivo a los formularios de auto-registro y encuestas. Sin acceso al panel de control administrativo.
- **Responsabilidades:**
  - Completar el proceso de auto-registro en el sistema.
  - Llenar las encuestas de caracterización de factores de riesgo iniciales.
  - Recibir notificaciones e información de seguimiento enviadas a su correo institucional.

---

## 2. Acceso al Sistema

Para ingresar a la plataforma, diríjase a la URL oficial del sistema. Se le presentará la pantalla de inicio de sesión donde deberá usar sus credenciales institucionales.

![Pantalla de Inicio de Sesión](./images/login_page_new.png)

1. Ingrese su **Correo Institucional** (ej. usuario@uceva.edu.co).
2. Digite su **Contraseña** segura.
3. Haga clic en el botón **"Iniciar Sesión"**.

> **Nota:** Si usted no cuenta con un usuario, puede hacer clic en "Solicitar acceso" en la parte inferior de la pantalla para ser redirigido al formulario de registro, el cual deberá ser aprobado por un administrador.

---

## 3. Panel de Control Principal (Dashboard)

Una vez haya ingresado, se encontrará con el panel principal de gestión. Este espacio centraliza la información más crítica de la población estudiantil bajo su supervisión.

![Panel de Control Principal](./images/dashboard_main_new.png)

### Elementos del Dashboard:
- **Barra de Navegación Lateral (Menú):** Permite cambiar entre el Tablero, Analíticas, Gestión de Usuarios y Configuraciones (las opciones varían según el rol).
- **Notificaciones (Campana Superior):** Le alerta sobre cambios críticos en los niveles de riesgo de sus estudiantes.
- **Tarjetas de Estadísticas Globales:** Un resumen inmediato de la "Población Total" y cuántos estudiantes se encuentran en "Riesgo Crítico", "Moderado" y "Bajo Riesgo".
- **Filtros Inteligentes:** Utilícelos para segmentar a los estudiantes por "Carrera", "Semestre" o "Nivel de Riesgo". 

### Listado General de Expedientes (Tarjetas de Estudiantes)

Debajo de los filtros encontrará el listado de estudiantes en formato de tarjetas individuales. 

![Listado de Estudiantes](./images/student_cards_new.png)

Cada tarjeta proporciona una vista rápida de:
- Programa y Semestre del estudiante.
- Promedio académico y número de ausencias.
- **Nivel de Riesgo actual:** Codificado por colores (Bajo en verde, Medio en naranja, Alto/Crítico en rojo).
- **Índice de Riesgo IA:** Una barra de porcentaje generada por la Inteligencia Artificial del sistema.
- **Alertas Tempranas:** Etiquetas con observaciones rápidas.

---

## 4. Módulo de Análisis y Reportes

Este módulo (disponible para Administradores y Coordinadores) consolida los datos de toda la institución en gráficos claros para la toma de decisiones.

![Módulo de Analíticas](./images/analytics_view_new.png)

- **Histórico Institucional de Riesgo:** Gráfico que muestra la evolución promedio del índice de riesgo de los estudiantes a través de los últimos 6 meses.
- **Distribución de Alarmas:** Un conteo rápido y visual de la cantidad exacta de alumnos en los diferentes rangos de riesgo en tiempo real.
- **Censo de Bienestar:** Refleja la totalidad de la población monitoreada de forma activa por EduAlert.

---

## 5. Gestión de Estudiantes: Creación y Seguimiento

El flujo principal de los **Docentes / Tutores** consiste en registrar estudiantes y hacerles seguimiento detallado mediante intervenciones y análisis de factores de riesgo.

### Paso 1: Agregar un Estudiante
Si tiene los permisos, en el panel principal seleccione **"Agregar Estudiante"**. Se abrirá un formulario solicitando:

![Agregar Nuevo Estudiante](./images/add_student_modal_1779304014648.png)
*(El modal de creación presenta campos claros y obligatorios para enrolar un alumno)*

1. Ingrese el Nombre Completo, Código Estudiantil y Correo Institucional.
2. Seleccione la Facultad, Programa Académico y Semestre.
3. Opcionalmente, añada un Promedio Inicial y número de Inasistencias.
4. Haga clic en **"Registrar Estudiante"**.

### Paso 2: Seguimiento e Intervención (Vista Detallada)
Para gestionar el caso de un estudiante, haga clic sobre su tarjeta en el panel principal. Esto abrirá el **Panel Lateral de Detalles del Estudiante**.

![Detalles del Estudiante e Intervenciones](./images/student_detail_modal_new.png)

En este panel encontrará distintas pestañas funcionales:
- **Factores:** Seleccione los factores de riesgo activos del estudiante (ej. "Bajo rendimiento académico", "Problemas socioeconómicos") para actualizar el algoritmo de cálculo. 
- **Intervenciones:** Registre cada reunión o llamada realizada con el estudiante. Este será su diario de seguimiento oficial.
- **Historial:** Un registro cronológico inmutable de cómo ha fluctuado su nivel de riesgo a través del tiempo.
- **Recomendaciones IA (Pestaña "IA"):** Si no sabe cómo proceder, consulte al motor neuronal del sistema para que le brinde recomendaciones de acción específicas según los factores marcados para ese alumno.
- **Notificación:** Visualice y envíe un correo electrónico estandarizado al estudiante u otros dependientes.

---

## 6. Gestión de Usuarios y Roles

La configuración del equipo de trabajo se realiza en la vista de **Gestión de Usuarios** (solo para administradores).

![Gestión de Usuarios](./images/user_management_new.png)

- **Agregar Personal:** Utilice el botón superior para dar de alta a nuevos Docentes, Coordinadores o personal de Bienestar.
- **Roles:** Defina correctamente el rol de la persona. Esto limitará o habilitará su acceso a módulos sensibles como la sección de Estadísticas.
- **Modificación y Estado:** La tabla principal le permite visualizar quién está activo. En la columna de "Acciones" podrá editar sus datos, desactivar temporalmente o eliminar la cuenta.

---
**Nota final:** EduAlert ha sido diseñado bajo estándares modernos de accesibilidad y facilidad de uso. Todo cambio realizado es registrado por el sistema en tiempo real. ¡Gracias por contribuir a la permanencia estudiantil en la UCEVA!
# Manual de Usuario - Portal de Estudiantes

Bienvenido al manual de uso del portal de estudiantes de **EduAlert**. Esta guía te explicará paso a paso cómo realizar tu proceso de auto-registro, completar la caracterización socioeconómica y consultar tu estado actual en la plataforma.

---

## Índice
1. [¿Qué es EduAlert?](#1-qué-es-edualert)
2. [Paso 1: Datos Personales](#2-paso-1-datos-personales)
3. [Paso 2: Encuesta Socioeconómica](#3-paso-2-encuesta-socioeconómica)
4. [Paso 3: Área Académica y Resultado](#4-paso-3-área-académica-y-resultado)

---

## 1. ¿Qué es EduAlert?

EduAlert es el sistema inteligente de bienestar de la institución diseñado para acompañarte en tu trayectoria académica. A través de este portal, podrás registrar tus datos para que el equipo de tutores y bienestar te brinden el apoyo necesario en caso de que presentes dificultades.

Para iniciar, debes ingresar a la dirección del portal de estudiantes y seguir el proceso de caracterización (Auto-registro).

---

## 2. Paso 1: Datos Personales

Al ingresar a la pantalla de registro, encontrarás el **Paso 1 de 3: Datos Personales**.

![Paso 1 - Datos Personales](./images/student_reg_step1_new.png)

En esta sección deberás proporcionar tu información básica:
1. **Nombre Completo:** Ingresa tus nombres y apellidos completos.
2. **Código Estudiantil:** Digita tu código de identificación asignado por la institución.
3. **Correo Electrónico:** Es indispensable usar tu correo institucional (`@uceva.edu.co`).
4. **Programa Académico:** Selecciona la carrera que te encuentras cursando.
5. **Semestre Actual:** Indica el semestre en el que estás matriculado.

Una vez validados todos los datos, el botón **"Siguiente"** se iluminará y te permitirá avanzar.

---

## 3. Paso 2: Encuesta Socioeconómica

El bienestar integral no solo se trata de notas. En el **Paso 2**, deberás completar una breve encuesta sobre tus condiciones socioeconómicas.

![Paso 2 - Área Socioeconómica](./images/student_reg_step2_new.png)

Las preguntas incluyen:
- **Estrato Socioeconómico:** Selecciona un número del 1 al 6.
- **Situación Laboral:** Indica si actualmente te encuentras laborando además de estudiar.
- **Acceso a Internet:** Responde con sinceridad si tienes acceso constante, intermitente o nulo.
- **Dependientes Económicos:** Si tienes personas a tu cargo, indícalo aquí.

> **Importante:** La información proporcionada es estrictamente confidencial. Solo será visualizada por el personal autorizado de Bienestar Universitario con el único fin de ofrecerte apoyos o subsidios pertinentes.

Si te equivocaste, puedes usar el botón **"Atrás"**. De lo contrario, haz clic en **"Siguiente"**.

---

## 4. Paso 3: Área Académica y Resultado

En el último paso, se te solicitará información sobre tu estado académico actual, como el promedio que llevas, inasistencias y materias cursando.

Una vez finalices y envíes la encuesta, el algoritmo de inteligencia artificial de EduAlert calculará de forma automática e inmediata tu **Índice de Riesgo**.

![Resultado del Registro](./images/student_reg_success_new.png)

Se te presentará la pantalla de **¡Registro Exitoso!** en donde podrás visualizar:
- Un **porcentaje** que representa tu índice calculado por la IA.
- El **nivel en el que te encuentras** (ej. "Riesgo Bajo", "Riesgo Medio", etc.).
- La **fecha exacta** de esta evaluación.

A partir de este momento, ya formas parte de la red de protección de EduAlert. Tu tutor asignado o un profesional de bienestar podrá contactarte a través del correo institucional proporcionado si identifica que necesitas acompañamiento. 

Puedes hacer clic en **"Ir al Inicio de Sesión"** si deseas explorar tu perfil de estudiante o responder nuevas alertas enviadas por la institución.
