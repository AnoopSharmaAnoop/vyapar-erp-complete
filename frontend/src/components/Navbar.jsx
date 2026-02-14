import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './Navbar.css';

const Navbar = () => {
  const { selectedCompany, clearCompany } = useApp();
  const navigate = useNavigate();

  const [showReportsMenu, setShowReportsMenu] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    clearCompany();
    navigate('/');
  };

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowReportsMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <h2>VyaparERP</h2>
        </Link>

        {selectedCompany && (
          <>
            <div className="navbar-menu">
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/items" className="nav-link">Items</Link>
              <Link to="/ledgers" className="nav-link">Ledgers</Link>
              <Link to="/vouchers" className="nav-link">Vouchers</Link>

              {/* ✅ CLICK DROPDOWN */}
              <div className="nav-dropdown" ref={dropdownRef}>
                <span
                  className="nav-link"
                  style={{ cursor: 'pointer' }}
                  onClick={() =>
                    setShowReportsMenu(!showReportsMenu)
                  }
                >
                  Reports ▼
                </span>

                {showReportsMenu && (
                  <div className="dropdown-menu">
                    <Link
                      to="/reports/trial-balance"
                      className="dropdown-item"
                      onClick={() => setShowReportsMenu(false)}
                    >
                      Trial Balance
                    </Link>

                    <Link
                      to="/reports/profit-loss"
                      className="dropdown-item"
                      onClick={() => setShowReportsMenu(false)}
                    >
                      Profit & Loss
                    </Link>

                    <Link
                      to="/reports/balance-sheet"
                      className="dropdown-item"
                      onClick={() => setShowReportsMenu(false)}
                    >
                      Balance Sheet
                    </Link>
                  </div>
                )}
              </div>

              <Link to="/users" className="nav-link">Users</Link>
            </div>

            <div className="navbar-right">
              <div className="company-info">
                <span className="company-name">
                  {selectedCompany.name}
                </span>
              </div>
              <button
                className="btn btn-secondary"
                onClick={handleLogout}
              >
                Switch Company
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
