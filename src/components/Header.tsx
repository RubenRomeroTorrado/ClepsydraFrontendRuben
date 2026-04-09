import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, CheckSquare, Users, Database, BarChart3, Activity } from 'lucide-react';
import logoC2 from '../assets/images/logo_c2.png';

const Header: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/about-c', label: 'Sobre', icon: Home },
    { path: '/biblio-dados', label: 'Biblioteca de Dados', icon: Database },
    { path: '/visual', label: 'Visualização', icon: BarChart3 },
    { path: '/condicoes-reais', label: 'Condições Reais', icon: Activity },
  ];

  return (
    <header className="fixed top-0 left-0 w-full bg-white text-blue-900 py-4 px-6 shadow z-50">
      <div className="container mx-auto flex items-center justify-between">
        {/* Lado esquerdo - Logo Clepsydra */}
        <div className="flex items-center space-x-4">
          <a href="https://clepsydra.interreg-euro-med.eu/" target="_blank" rel="noopener noreferrer">
            <img
              src={logoC2}
              alt="Clepsydra Logo"
              className="h-16 w-auto"
              loading="eager"
            />
          </a>
        </div>

        {/* Lado direito - Navegação */}
        <nav className="flex-1">
          <div className="flex items-center justify-end space-x-6">
            <ul className="flex items-center space-x-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`text-blue-900 nav-link font-medium text-sm flex items-center ${
                        isActive ? 'active font-semibold' : ''
                      }`}
                    >
                      <Icon size={16} className="mr-1" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header; 