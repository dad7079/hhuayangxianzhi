import React from 'react';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  isAdmin?: boolean;
  onLogout?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, isAdmin, onLogout }) => {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    }
    // Explicitly navigate to home to prevent redirect to login
    navigate('/');
  };

  return (
    <div className="min-h-screen font-serif bg-paper-dark bg-texture flex flex-col items-center py-4 sm:py-8 px-2 sm:px-4">
      {/* Outer Border Frame */}
      <div className="w-full max-w-5xl bg-paper border-double border-4 border-ink/30 shadow-2xl min-h-[90vh] relative flex flex-col">
        
        {/* Decorative Corner Borders */}
        <div className="absolute top-2 left-2 w-8 h-8 border-t-4 border-l-4 border-ink/60 rounded-tl-lg pointer-events-none"></div>
        <div className="absolute top-2 right-2 w-8 h-8 border-t-4 border-r-4 border-ink/60 rounded-tr-lg pointer-events-none"></div>
        <div className="absolute bottom-2 left-2 w-8 h-8 border-b-4 border-l-4 border-ink/60 rounded-bl-lg pointer-events-none"></div>
        <div className="absolute bottom-2 right-2 w-8 h-8 border-b-4 border-r-4 border-ink/60 rounded-br-lg pointer-events-none"></div>

        {/* Header */}
        <header className="border-b-2 border-ink/10 p-6 text-center relative bg-texture">
          <div 
            onClick={() => navigate('/')}
            className="cursor-pointer inline-block group"
          >
             <div className="flex flex-col items-center">
                <div className="bg-seal text-white text-xs px-2 py-0.5 mb-2 rounded-sm opacity-80 shadow-sm font-bold tracking-widest">嘉庆版</div>
                <h1 className="text-4xl md:text-6xl font-title text-ink tracking-widest group-hover:text-seal transition-colors duration-500">
                  华阳县志
                </h1>
             </div>
          </div>
          
          <div className="absolute top-4 right-4 flex gap-3 text-sm">
             {isAdmin ? (
               <div className="flex items-center gap-2">
                 <span className="text-seal font-bold">管理员: llh</span>
                 <button onClick={handleLogoutClick} className="text-ink/60 hover:text-ink underline">退出</button>
               </div>
             ) : (
               <button onClick={() => navigate('/login')} className="text-ink/40 hover:text-seal transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                 </svg>
               </button>
             )}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-grow p-4 md:p-8 relative z-10">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-ink/10 p-4 text-center text-ink/40 text-sm font-serif">
          <p>蜀都古韵 · 岁月留痕</p>
        </footer>
      </div>
    </div>
  );
};