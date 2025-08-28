import React from 'react';

interface SimpleLayoutProps {
  children: React.ReactNode;
  title?: string;
  showHeader?: boolean;
}

const SimpleLayout: React.FC<SimpleLayoutProps> = ({
  children,
  title = 'WebApp',
  showHeader = true
}) => {
  return (
    <div className="min-h-screen bg-family-background">
      {showHeader && (
        <header className="bg-family-header px-4 py-4 shadow-mobile-sm">
          <div className="flex items-center gap-3">
            {/* Logo/Icon placeholder - sostituisci con il tuo logo */}
            <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm transform rotate-45"></div>
            </div>
            <h1 className="text-xl font-semibold text-family-header-text tracking-wide">
              {title}
            </h1>
          </div>
        </header>
      )}
      
      <main className="px-mobile-md py-mobile-lg">
        {children}
      </main>
    </div>
  );
};

export default SimpleLayout;