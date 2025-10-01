// src/utilities/creditScoreUtils.js (actualizado para retornar desglose)
export const calculateCreditScore = (data) => {
  if (!data || !data.datosCliente) return { score: 0, details: [] };
  let score = 0;
  const details = [];
  const now = new Date('2025-10-01');
  const datos = data.datosCliente;

  // 1. Edad
  const birthDate = new Date(datos.fechaNacimiento);
  let age = now.getFullYear() - birthDate.getFullYear();
  const monthDiff = now.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) age--;
  let agePoints = 0;
  let ageReason = '';
  if (age >= 25 && age <= 60) {
    agePoints = 20;
  } else if (age > 60 && age <= 70) {
    agePoints = -10;
    ageReason = 'Edad avanzada (61-70 años)';
  } else {
    agePoints = -30;
    ageReason = `Edad muy avanzada (${age} años)`;
  }
  score += agePoints;
  details.push({ factor: 'Edad', points: agePoints, reason: ageReason });

  // 2. DNI
  const dniExpiry = new Date(datos.fechaCaducidadDni);
  let dniPoints = 0;
  let dniReason = '';
  if (dniExpiry > now) {
    dniPoints = 10;
  } else {
    dniPoints = -15;
    dniReason = 'DNI caducado';
  }
  score += dniPoints;
  details.push({ factor: 'DNI', points: dniPoints, reason: dniReason });

  // 3. Nivel educativo
  const nivel = datos.nivelEducativo?.toLowerCase() || '';
  let eduPoints = 0;
  let eduReason = '';
  if (nivel.includes('superior') || nivel.includes('técnico') || nivel.includes('universitario')) {
    eduPoints = 15;
  } else if (nivel.includes('secundaria')) {
    eduPoints = 10;
  } else if (nivel.includes('primaria')) {
    eduPoints = 5;
  } else {
    eduPoints = -5;
    eduReason = 'Nivel educativo no especificado';
  }
  score += eduPoints;
  details.push({ factor: 'Educación', points: eduPoints, reason: eduReason });

  // 4. Estado civil
  const estadoCivil = datos.estadoCivil?.toLowerCase() || '';
  let civilPoints = 0;
  let civilReason = '';
  if (estadoCivil.includes('casado') || estadoCivil.includes('concubinato')) {
    civilPoints = 10;
  } else if (estadoCivil.includes('soltero')) {
    civilPoints = -5;
    civilReason = 'Estado civil soltero (menos estabilidad)';
  }
  score += civilPoints;
  details.push({ factor: 'Estado Civil', points: civilPoints, reason: civilReason });

  // 5. Residencia en Perú
  let resPoints = 0;
  let resReason = '';
  if (datos.residePeru) {
    resPoints = 5;
  } else {
    resPoints = -10;
    resReason = 'No reside en Perú';
  }
  score += resPoints;
  details.push({ factor: 'Residencia Perú', points: resPoints, reason: resReason });

  // 6. Enfermedades
  let healthPoints = 0;
  let healthReason = '';
  if (!datos.enfermedadesPreexistentes) {
    healthPoints = 10;
  } else {
    healthPoints = -10;
    healthReason = 'Enfermedades preexistentes';
  }
  score += healthPoints;
  details.push({ factor: 'Salud', points: healthPoints, reason: healthReason });

  // 7. Exposición política
  let polPoints = 0;
  let polReason = '';
  if (!datos.expuestaPoliticamente) {
    polPoints = 10;
  } else {
    polPoints = -15;
    polReason = 'Expuesto políticamente (alto riesgo)';
  }
  score += polPoints;
  details.push({ factor: 'Exposición Política', points: polPoints, reason: polReason });

  // 8. Estabilidad residencial
  const dir = datos.direcciones?.[0];
  let resStabPoints = 0;
  let resStabReason = '';
  if (dir) {
    const tiempoRes = parseInt(dir.tiempoResidencia) || 0;
    if (tiempoRes > 2) {
      resStabPoints = 15;
    } else if (tiempoRes > 1) {
      resStabPoints = 10;
    } else {
      resStabPoints = -5;
      resStabReason = 'Tiempo de residencia corto';
    }
  } else {
    resStabPoints = -10;
    resStabReason = 'Sin dirección registrada';
  }
  score += resStabPoints;
  details.push({ factor: 'Estabilidad Residencial', points: resStabPoints, reason: resStabReason });

  // 9. Empleo
  const emp = datos.empleos?.[0];
  let empPoints = 0;
  let empReason = '';
  if (emp) {
    const jobStart = new Date(emp.inicioLaboral);
    const jobMonths = (now - jobStart) / (1000 * 60 * 60 * 24 * 30);
    let jobAnt = 0;
    if (jobMonths > 12) {
      jobAnt = 20;
    } else {
      jobAnt = -10;
      empReason += 'Antigüedad laboral corta; ';
    }
    let income = 0;
    if (emp.ingresoMensual > 1500) {
      income = 25;
    } else {
      income = -5;
      empReason += 'Ingreso bajo; ';
    }
    let sitPoints = 0;
    const situacion = emp.situacionLaboral?.toLowerCase();
    if (situacion?.includes('dependiente') || situacion?.includes('independiente')) {
      sitPoints = 10;
    } else {
      sitPoints = -5;
      empReason += 'Situación laboral no estable';
    }
    empPoints = jobAnt + income + sitPoints;
  } else {
    empPoints = -30;
    empReason = 'Sin empleo registrado';
  }
  score += empPoints;
  details.push({ factor: 'Empleo', points: empPoints, reason: empReason });

  // 10. Contactos
  const numContacts = datos.contactos?.length || 0;
  let contPoints = 0;
  let contReason = '';
  if (numContacts >= 2) {
    contPoints = 10;
  } else if (numContacts === 1) {
    contPoints = 5;
  } else {
    contPoints = -10;
    contReason = 'Sin contactos';
  }
  score += contPoints;
  details.push({ factor: 'Contactos', points: contPoints, reason: contReason });

  // 11. Cuenta bancaria
  let bankPoints = 0;
  let bankReason = '';
  if (datos.cuentasBancarias?.length > 0) {
    bankPoints = 15;
  } else {
    bankPoints = -10;
    bankReason = 'Sin cuenta bancaria';
  }
  score += bankPoints;
  details.push({ factor: 'Cuenta Bancaria', points: bankPoints, reason: bankReason });

  // 12. Aval
  const aval = data.aval;
  let avalPoints = 0;
  let avalReason = '';
  if (aval && aval.dniAval && aval.telefonoMovilAval && aval.direccionAval) {
    avalPoints = 20;
  } else if (aval) {
    avalPoints = 10;
    avalReason = 'Aval incompleto';
  } else {
    avalPoints = -10;
    avalReason = 'Sin aval';
  }
  score += avalPoints;
  details.push({ factor: 'Aval', points: avalPoints, reason: avalReason });

  // 13. RUC
  let rucPoints = 0;
  let rucReason = '';
  if (datos.ruc) {
    rucPoints = 10;
  } else {
    rucPoints = -5;
    rucReason = 'Sin RUC';
  }
  score += rucPoints;
  details.push({ factor: 'RUC', points: rucPoints, reason: rucReason });

  // Normalizar
  score = Math.max(0, Math.min(100, score));

  return { score, details };
};