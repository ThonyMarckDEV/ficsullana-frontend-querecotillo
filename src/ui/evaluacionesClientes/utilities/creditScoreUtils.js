// src/utilities/creditScoreUtils.js
// Algoritmo reutilizable para calcular el Credit Score (0-100, más alto = más confiable)
// Basado en datos de tablas: datos, direcciones, contactos, empleos, cuentas_bancarias, avales
export const calculateCreditScore = (data) => {
  if (!data || !data.datosCliente) return 0;
  let score = 0;
  const now = new Date('2025-10-01'); // Fecha fija proporcionada
  const datos = data.datosCliente;

  // 1. Edad óptima (25-60 años: +20 puntos)
  const birthDate = new Date(datos.fechaNacimiento);
  let age = now.getFullYear() - birthDate.getFullYear();
  const monthDiff = now.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) age--;
  if (age >= 25 && age <= 60) score += 20;
  else score -= 5; // Penalización leve

  // 2. DNI no caducado (+10)
  if (new Date(datos.fechaCaducidadDni) > now) score += 10;

  // 3. Nivel educativo (Superior/Técnico: +15, Secundaria: +10, Primaria: +5)
  const nivel = datos.nivelEducativo?.toLowerCase();
  if (nivel.includes('superior') || nivel.includes('técnico')) score += 15;
  else if (nivel.includes('secundaria')) score += 10;
  else if (nivel.includes('primaria')) score += 5;

  // 4. Estado civil estable (Casado/Concubinato: +10)
  const estadoCivil = datos.estadoCivil?.toLowerCase();
  if (estadoCivil.includes('casado') || estadoCivil.includes('concubinato')) score += 10;

  // 5. Residencia en Perú (+5)
  if (datos.residePeru) score += 5;

  // 6. Sin enfermedades preexistentes (+10)
  if (!datos.enfermedadesPreexistentes) score += 10;

  // 7. No expuesto políticamente (+10)
  if (!datos.expuestaPoliticamente) score += 10;

  // 8. Estabilidad residencial (tiempoResidencia > 2 años: +15)
  const dir = datos.direcciones?.[0];
  if (dir) {
    const tiempoRes = parseInt(dir.tiempoResidencia) || 0;
    if (tiempoRes > 2) score += 15;
    else if (tiempoRes > 1) score += 10;
  }

  // 9. Empleo estable (antigüedad >12 meses: +20, ingresoMensual >1500: +25, situación laboral 'Dependiente' o 'Independiente': +10)
  const emp = datos.empleos?.[0];
  if (emp) {
    const jobStart = new Date(emp.inicioLaboral);
    const jobMonths = (now.getTime() - jobStart.getTime()) / (1000 * 60 * 60 * 24 * 30);
    if (jobMonths > 12) score += 20;
    if (emp.ingresoMensual > 1500) score += 25;
    const situacion = emp.situacionLaboral?.toLowerCase();
    if (situacion.includes('dependiente') || situacion.includes('independiente')) score += 10;
  }

  // 10. Múltiples contactos (2 o más: +10)
  const numContacts = datos.contactos?.length || 0;
  if (numContacts >= 2) score += 10;

  // 11. Cuenta bancaria verificada (+15)
  if (datos.cuentasBancarias?.length > 0) score += 15;

  // 12. Aval presente y completo (DNI + teléfono + dirección: +20)
  const aval = data.aval;
  if (aval && aval.dniAval && aval.telefonoMovilAval && aval.direccionAval) score += 20;

  // 13. RUC presente (para independientes: +10)
  if (datos.ruc) score += 10;

  // Normalizar a 0-100
  return Math.max(0, Math.min(100, score));
};