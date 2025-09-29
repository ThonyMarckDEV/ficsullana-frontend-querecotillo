// src/components/common/Pagination.jsx
import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex justify-center items-center space-x-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-white border border-yellow-500 text-red-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-50"
      >
        Anterior
      </button>
      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-4 py-2 border rounded-md ${currentPage === page ? 'bg-red-700 text-white border-red-700' : 'bg-white border-yellow-500 text-red-700 hover:bg-yellow-50'}`}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 bg-white border border-yellow-500 text-red-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-50"
      >
        Siguiente
      </button>
    </div>
  );
};

export default Pagination;