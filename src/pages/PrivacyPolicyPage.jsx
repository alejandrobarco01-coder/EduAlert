import React from 'react';

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="bg-indigo-600 px-8 py-10 text-white">
          <h1 className="text-3xl font-bold">Política de Privacidad y Tratamiento de Datos</h1>
          <p className="mt-2 text-indigo-100 italic">Conforme a la Ley 1581 de 2012 (Habeas Data Colombia)</p>
        </div>
        
        <div className="px-8 py-10 prose prose-slate max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4 border-b pb-2">1. Marco Legal</h2>
            <p className="text-slate-600 leading-relaxed">
              EduAlert se compromete con la protección de los datos personales de los estudiantes, docentes y personal administrativo,
              dando cumplimiento a lo dispuesto en la <strong>Ley 1581 de 2012</strong>, el Decreto 1377 de 2013 y demás normas que las modifiquen o adicionen.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4 border-b pb-2">2. Finalidad del Tratamiento</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Los datos recolectados por EduAlert tienen como finalidad única y exclusiva:
            </p>
            <ul className="list-disc pl-5 text-slate-600 space-y-2">
              <li>Identificar estudiantes en riesgo académico o de deserción.</li>
              <li>Facilitar la asignación de tutores y el seguimiento de intervenciones.</li>
              <li>Generar estadísticas institucionales anonimizadas para la toma de decisiones.</li>
              <li>Notificar alertas tempranas a los actores involucrados en el proceso de retención.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4 border-b pb-2">3. Medidas de Seguridad y Mitigación</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Para mitigar riesgos de pérdida o filtración de datos sensibles, EduAlert ha implementado:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="font-bold text-indigo-600 text-sm uppercase mb-2">Cifrado de Datos</h3>
                <p className="text-xs text-slate-500">Uso de algoritmos AES-256 para proteger información sensible en reposo.</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="font-bold text-indigo-600 text-sm uppercase mb-2">Control de Acceso</h3>
                <p className="text-xs text-slate-500">Autenticación JWT y Control de Acceso Basado en Roles (RBAC).</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="font-bold text-indigo-600 text-sm uppercase mb-2">Auditoría</h3>
                <p className="text-xs text-slate-500">Registro permanente de logs de acceso y acciones críticas.</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="font-bold text-indigo-600 text-sm uppercase mb-2">Monitoreo</h3>
                <p className="text-xs text-slate-500">Revisiones mensuales de logs y pruebas de vulnerabilidad trimestrales.</p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4 border-b pb-2">4. Derechos del Titular</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              De acuerdo con la ley, usted tiene derecho a:
            </p>
            <ul className="list-disc pl-5 text-slate-600 space-y-2 text-sm">
              <li>Conocer, actualizar y rectificar sus datos personales.</li>
              <li>Solicitar prueba de la autorización otorgada.</li>
              <li>Ser informado sobre el uso que se le ha dado a sus datos.</li>
              <li>Presentar quejas ante la Superintendencia de Industria y Comercio.</li>
              <li>Revocar la autorización o solicitar la supresión del dato cuando no se respeten los principios, derechos y garantías constitucionales y legales.</li>
            </ul>
          </section>

          <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-center text-slate-400 text-xs">
            <span>Última actualización: Mayo 2026</span>
            <button 
              onClick={() => window.history.back()}
              className="text-indigo-600 font-medium hover:text-indigo-800"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
