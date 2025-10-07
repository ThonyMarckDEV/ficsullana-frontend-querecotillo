// src/components/UserInfo.jsx

import React from 'react';

// Componente auxiliar para mostrar un par de etiqueta-valor
const InfoPair = ({ label, value }) => (
  <div>
    <p className="text-xs font-semibold text-gray-500">{label}</p>
    <p className="text-sm text-gray-800">{value || 'N/A'}</p>
  </div>
);

// Componente auxiliar para crear secciones con título
const Section = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-md font-bold text-gray-700 border-b-2 border-gray-200 pb-2 mb-3">
      {title}
    </h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {children}
    </div>
  </div>
);

const UserInfo = ({ cliente }) => {
  const { datosCliente } = cliente;
  if (!datosCliente) return <p>No hay datos del cliente para mostrar.</p>;

  const {
    nombre,
    apellidoPaterno,
    apellidoMaterno,
    dni,
    fechaNacimiento,
    estadoCivil,
    nacionalidad,
    nivelEducativo,
    profesion,
    residePeru,
    expuestaPoliticamente,
  } = datosCliente;
  
  // Asumiendo que las colecciones pueden estar vacías
  const contacto = datosCliente.contactos?.[0] || {};
  const direccion = datosCliente.direcciones?.[0] || {};
  const empleo = datosCliente.empleos?.[0] || {};
  const cuenta = datosCliente.cuentas_bancarias?.[0] || {};
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
        <InfoPair label="Reside en Perú" value={residePeru ? 'Sí' : 'No'} />
        <InfoPair label="Políticamente Expuesto" value={expuestaPoliticamente ? 'Sí' : 'No'} />
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
        <InfoPair label="Tipo de Vivienda" value={direccion.tipoVivienda} />
        <InfoPair label="Tiempo de Residencia (años)" value={direccion.tiempoResidencia} />
      </Section>

      <Section title="Información Laboral">
        <InfoPair label="Centro Laboral" value={empleo.centroLaboral} />
        <InfoPair label="Situación Laboral" value={empleo.situacionLaboral} />
        <InfoPair label="Ingreso Mensual" value={empleo.ingresoMensual ? `S/ ${empleo.ingresoMensual.toFixed(2)}` : 'N/A'} />
        <InfoPair label="Fecha de Inicio Laboral" value={empleo.inicioLaboral} />
      </Section>
      
      <Section title="Información Bancaria">
        <InfoPair label="Entidad Financiera" value={cuenta.entidadFinanciera} />
        <InfoPair label="Cuenta de Ahorros" value={cuenta.ctaAhorros} />
        <InfoPair label="CCI" value={cuenta.cci} />
      </Section>

      {aval.dniAval && (
         <Section title="Datos del Aval">
            <InfoPair label="Nombre Completo" value={`${aval.nombresAval} ${aval.apellidoPaternoAval} ${aval.apellidoMaternoAval}`} />
            <InfoPair label="DNI del Aval" value={aval.dniAval} />
            <InfoPair label="Relación con el Cliente" value={aval.relacionClienteAval} />
            <InfoPair label="Teléfono Móvil" value={aval.telefonoMovilAval} />
            <InfoPair label="Dirección" value={aval.direccionAval} />
         </Section>
      )}
    </div>
  );
};

export default UserInfo;