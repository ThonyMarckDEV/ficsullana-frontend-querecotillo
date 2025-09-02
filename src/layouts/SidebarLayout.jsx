// src/layouts/MainLayout.jsx
import React from "react";
import Sidebar from "../components/Shared/SideBar";

const SidebarLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-6 bg-gray-50">{children}</main>
    </div>
  );
};

export default SidebarLayout;
