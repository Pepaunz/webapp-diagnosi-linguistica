// src/components/layout/SimpleLayout.tsx
import React from 'react';

interface SimpleLayoutProps {
  children: React.ReactNode;
  title?: string;
  showHeader?: boolean;
}

const SimpleLayout: React.FC<SimpleLayoutProps> = ({
  children,
  title = 'Questionario Bilinguismo',
  showHeader = true
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {showHeader && (
        <header className="bg-white border-b border-gray-200 px-4 py-4 safe-area-top">
          <div className="max-w-lg mx-auto">
            <h1 className="text-xl font-semibold text-gray-900 text-center">{title}</h1>
          </div>
        </header>
      )}
      
      <main className="flex-1 flex items-center justify-center p-4 safe-area-bottom">
        <div className="w-full max-w-sm mx-auto">
          {children}
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-200 px-4 py-4 safe-area-bottom">
        <div className="max-w-lg mx-auto text-center text-sm text-gray-500">
          <p>Questionario per la valutazione del bilinguismo nei bambini</p>
        </div>
      </footer>
    </div>
  );
};

export default SimpleLayout;