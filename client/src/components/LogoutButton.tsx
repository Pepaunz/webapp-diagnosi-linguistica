// client/src/components/LogoutButton.tsx
import React, { ButtonHTMLAttributes } from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useError } from '../context/ErrorContext';

export const LogoutButton: React.FC<ButtonHTMLAttributes<HTMLButtonElement>> = () => {
  const { logout } = useAuth();
  const { showSuccess } = useError();

  const handleLogout = () => {
    logout();
    showSuccess('Disconnesso con successo');
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 text-gray-600 text-white "
      title="Disconnetti"
    >
      <LogOut size={20} />
       <span>Esci</span>
    </button>
  );
};