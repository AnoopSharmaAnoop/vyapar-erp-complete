import React, { createContext, useState, useContext, useEffect } from 'react';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    // Load selected company from localStorage
    const savedCompany = localStorage.getItem('selectedCompany');
  if (savedCompany) {
  const company = JSON.parse(savedCompany);
  setSelectedCompany({
    ...company,
    id: company.id ?? company._id,
  });
}

  }, []);

const selectCompany = (company) => {
  const normalizedCompany = {
    ...company,
    id: company.id ?? company._id,
  };

  setSelectedCompany(normalizedCompany);
  localStorage.setItem('selectedCompany', JSON.stringify(normalizedCompany));
};


 
  const clearCompany = () => {
    setSelectedCompany(null);
    localStorage.removeItem('selectedCompany');
  };

  const value = {
    selectedCompany,
    setSelectedCompany: selectCompany,
    clearCompany,
    companies,
    setCompanies,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
