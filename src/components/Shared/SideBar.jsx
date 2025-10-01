import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bars3Icon, ChevronDownIcon } from '@heroicons/react/24/outline';
import jwtUtils from '../../utilities/jwtUtils';
import { logout } from '../../js/logout';
import ficsullanalogo from '../../assets/img/Logo_FICSULLANA.png';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openSections, setOpenSections] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);

  const refresh_token = jwtUtils.getRefreshTokenFromCookie();
  const rol = refresh_token ? jwtUtils.getUserRole(refresh_token) : null;

  const handleLogout = () => {
    logout();
    setShowConfirm(false);
  };

  const menus = {
    superadmin: [
      {
        section: 'Home',
        link: '/superadmin',
      },
      {
        section: 'Clientes',
        link: '/superadmin/clientes',
      },      
      {
        section: 'Empleados',
        link: '/superadmin/empleados',
      },
    ],
    admin: [
      {
        section: 'Dashboard',
        link: '/admin/dashboard',
      },
      {
        section: 'Users',
        subs: [
          { name: 'List Users', link: '/admin/users/list' },
          { name: 'Add User', link: '/admin/users/add' },
        ],
      },
      {
        section: 'Settings',
        subs: [
          { name: 'General', link: '/admin/settings/general' },
          { name: 'Security', link: '/admin/settings/security' },
        ],
      },
    ],
    cliente: [
      {
        section: 'Home',
        link: '/cliente',
      },
      {
        section: 'Solicitud Préstamos',
        subs: [
          { name: 'Solicitar', link: '/cliente/solicitar-prestamo' },
          { name: 'Mis Solicitudes', link: '/cliente/mis-solicitudes' },
        ],
      },
      {
        section: 'Support',
        link: '/cliente/support',
      },
    ],
    asesor: [
      {
        section: 'Dashboard',
        link: '/asesor/dashboard',
      },
      {
        section:'Evaluaciones',
        subs:[
          {name:'Evaluar Cliente' , link:'/asesor/evaluacion-cliente'},
          {name:'Evaluaciones Enviadas' ,  link: '/asesor/evaluaciones-enviadas'}
        ]
      },
    ],
    auditor: [
      {
        section: 'Dashboard',
        link: '/auditor/dashboard',
      },
      {
        section: 'Reports',
        link: '/auditor/reports',
      },
      {
        section: 'Teams',
        subs: [
          { name: 'Team List', link: '/encargado/teams/list' },
          { name: 'Assign Tasks', link: '/encargado/teams/tasks' },
        ],
      },
    ],
    cajero: [
      {
        section: 'Dashboard',
        link: '/cajero/dashboard',
      },
      {
        section: 'Reports',
        link: '/cajero/reports',
      },
      {
        section: 'Teams',
        subs: [
          { name: 'Team List', link: '/encargado/teams/list' },
          { name: 'Assign Tasks', link: '/encargado/teams/tasks' },
        ],
      },
    ],
      jefe_negocios: [
      {
        section:'Evaluaciones',
        subs:[
          {name:'Evaluaciones Clientes' ,  link: '/jefe-negocios/evaluaciones-clientes'}
        ]
      },
    ],
  };

  const roleMenu = rol && menus[rol] ? menus[rol] : [];

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <>
      {/* Hamburger button for mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-red-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bars3Icon className="h-6 w-6 text-gray-800" />
      </button>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:fixed md:block`}
      >
        {/* Top half: White with image */}
        <div className="h-1/4 bg-white flex items-center justify-center">
          <img
            src={ficsullanalogo}
            alt="Logo"
            className="h-60 w-auto"
          />
        </div>

        {/* Bottom half: Red with menu */}
        <div className="h-3/4 bg-red-500 overflow-y-auto p-4 flex flex-col">
          <nav className="space-y-2 flex-grow">
            {roleMenu.map((item, index) => (
              <div key={index}>
                {item.subs ? (
                  <>
                    <button
                      className="w-full flex items-center justify-between text-white py-2 px-4 rounded-md hover:bg-red-600 transition focus:outline-none"
                      onClick={() => toggleSection(item.section)}
                    >
                      <span>{item.section}</span>
                      <ChevronDownIcon
                        className={`h-5 w-5 transform transition-transform ${
                          openSections[item.section] ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {openSections[item.section] && (
                      <ul className="ml-4 space-y-1">
                        {item.subs.map((sub, subIndex) => (
                          <li key={subIndex}>
                            <Link
                              to={sub.link}
                              className="block text-white py-1 px-4 rounded-md hover:bg-red-600 transition"
                              onClick={() => setIsOpen(false)}
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    to={item.link}
                    className="block text-white py-2 px-4 rounded-md hover:bg-red-600 transition"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.section}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Logout button at the bottom */}
          <div className="mt-auto p-4 border-t border-red-700">
            <button
              onClick={() => setShowConfirm(true)}
              className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

      </div>

      {/* Confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              ¿Estás seguro/a de cerrar sesión?
            </h3>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                No
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Sí
              </button>
            </div>
          </div>
        </div>
      )}


    </>
  );
};

export default Sidebar;
