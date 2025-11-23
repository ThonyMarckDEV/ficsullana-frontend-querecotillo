import React from 'react';

const InfoPair = ({ label, value }) => (
  <div>
    <p className="text-xs font-semibold text-gray-500">{label}</p>
    <p className="text-sm text-gray-800">{value || 'N/A'}</p>
  </div>
);

const Section = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-md font-bold text-gray-700 border-b-2 border-gray-200 pb-2 mb-3">{title}</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">{children}</div>
  </div>
);

const UserInfo = ({ cliente }) => {
  // cliente viene como { datosCliente: {...}, aval: {...} } del JSON de respuesta
  const { datosCliente } = cliente;
  if (!datosCliente) return <p>No hay datos del cliente.</p>;

  const {
    nombre, apellidoPaterno, apellidoMaterno, dni, fechaNacimiento,
    estadoCivil, nacionalidad, nivelEducativo, profesion, residePeru, expuestaPoliticamente
  } = datosCliente;

  // Extracción segura de arrays del JSON (contactos, direcciones, etc., están en datosCliente)
  const contacto = datosCliente.contactos?.[0] || {};
  const direccion = datosCliente.direcciones?.[0] || {};
  const empleo = datosCliente.empleos?.[0] || {};
  const cuenta = datosCliente.cuentas_bancarias?.[0] || {};

  // El aval viene directo del objeto cliente (evaluación)
  const aval = cliente.aval || {};

  return (
    <div className="p-1">
      <Section title="Datos Personales">
        <InfoPair label="Nombre Completo" value={`${nombre} ${apellidoPaterno} ${apellidoMaterno}`} />
        <InfoPair label="DNI" value={dni} />
        <InfoPair label="Fecha de Nacimiento" value={fechaNacimiento} />
        <InfoPair label="Estado Civil" value={estadoCivil} />
        <InfoPair label="Nacionalidad" value={nacionalidad} />
        <InfoPair label="Nivel Educativo" value={nivelEducativo} />
        <InfoPair label="Profesión" value={profesion} />
        <InfoPair label="Reside en Perú" value={residePeru == 1 ? 'Sí' : 'No'} />
      </Section>

      <Section title="Información de Contacto">
        <InfoPair label="Correo Electrónico" value={contacto.correo} />
        <InfoPair label="Teléfono Móvil" value={contacto.telefonoMovil} />
        <InfoPair label="Teléfono Fijo" value={contacto.telefonoFijo} />
      </Section>

      <Section title="Dirección">
        <InfoPair label="Dirección Fiscal" value={direccion.direccionFiscal} />
        <InfoPair label="Departamento" value={direccion.departamento} />
        <InfoPair label="Provincia" value={direccion.provincia} />
        <InfoPair label="Distrito" value={direccion.distrito} />
      </Section>

      <Section title="Información Laboral">
        <InfoPair label="Centro Laboral" value={empleo.centroLaboral} />
        <InfoPair label="Situación Laboral" value={empleo.situacionLaboral} />
        <InfoPair label="Ingreso Mensual" value={empleo.ingresoMensual ? `S/ ${parseFloat(empleo.ingresoMensual).toFixed(2)}` : 'N/A'} />
      </Section>
      
      <Section title="Información Bancaria">
        <InfoPair label="Entidad Financiera" value={cuenta.entidadFinanciera} />
        <InfoPair label="Cuenta de Ahorros" value={cuenta.ctaAhorros} />
      </Section>

      {/* Mostrar aval si existe DNI registrado en la evaluación */}
      {aval.dniAval && (
         <Section title="Datos del Aval (De esta evaluación)">
            <InfoPair label="Nombre Completo" value={`${aval.nombresAval} ${aval.apellidoPaternoAval}`} />
            <InfoPair label="DNI del Aval" value={aval.dniAval} />
            <InfoPair label="Relación" value={aval.relacionClienteAval} />
            <InfoPair label="Teléfono" value={aval.telefonoMovilAval} />
            <InfoPair label="Dirección" value={aval.direccionAval} />
         </Section>
      )}
    </div>
  );
};

export default UserInfo;