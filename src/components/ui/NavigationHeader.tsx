'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavigationHeaderProps {
  showNav?: boolean;
  currentPage?: 'home' | 'admin' | 'observer';
  onBack?: () => void;
}

export function NavigationHeader({
  showNav = true,
  currentPage = 'home',
  onBack
}: NavigationHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigation = (path: string) => {
    window.location.href = path;
    setIsMenuOpen(false);
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderBottom: '1px solid var(--border-soft)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo / Brand */}
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Go back"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <button
            onClick={() => handleNavigation('/')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-calm-100)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--color-calm-700)">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <span className="font-semibold" style={{ color: 'var(--foreground)' }}>
              Mediator
            </span>
          </button>
        </div>

        {/* Desktop Nav */}
        {showNav && (
          <nav className="hidden md:flex items-center gap-1">
            <NavLink
              active={currentPage === 'home'}
              onClick={() => handleNavigation('/')}
            >
              Conversations
            </NavLink>
            <NavLink
              active={currentPage === 'observer'}
              onClick={() => handleNavigation('/observer')}
            >
              Observer
            </NavLink>
            <NavLink
              active={currentPage === 'admin'}
              onClick={() => handleNavigation('/admin')}
            >
              Admin
            </NavLink>
          </nav>
        )}

        {/* Mobile Menu Button */}
        {showNav && (
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
        )}
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && showNav && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden"
            style={{ backgroundColor: 'var(--background)' }}
          >
            <nav className="px-4 py-2 flex flex-col gap-1">
              <MobileNavLink
                active={currentPage === 'home'}
                onClick={() => handleNavigation('/')}
              >
                Conversations
              </MobileNavLink>
              <MobileNavLink
                active={currentPage === 'observer'}
                onClick={() => handleNavigation('/observer')}
              >
                Observer Mode
              </MobileNavLink>
              <MobileNavLink
                active={currentPage === 'admin'}
                onClick={() => handleNavigation('/admin')}
              >
                Admin Dashboard
              </MobileNavLink>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function NavLink({
  children,
  active,
  onClick
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
      style={{
        backgroundColor: active ? 'var(--color-calm-100)' : 'transparent',
        color: active ? 'var(--color-calm-700)' : 'var(--color-calm-500)',
      }}
    >
      {children}
    </button>
  );
}

function MobileNavLink({
  children,
  active,
  onClick
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors"
      style={{
        backgroundColor: active ? 'var(--color-calm-100)' : 'transparent',
        color: active ? 'var(--color-calm-700)' : 'var(--color-calm-600)',
      }}
    >
      {children}
    </button>
  );
}
