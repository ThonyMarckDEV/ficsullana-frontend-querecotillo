import React from 'react';
import Sidebar from '../../components/Shared/SideBar';

const Home = () => {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 md:ml-64 p-6">
        <h1 className="text-2xl font-bold text-gray-800">Bienvenido al Home Rol: Cliente</h1>
      </div>
    </div>
  );
};

export default Home;
