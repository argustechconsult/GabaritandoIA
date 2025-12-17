import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "h-10 w-auto" }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Ícone: Cérebro com Checkmark estilizado */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto flex-shrink-0"
        aria-label="GabaritandoIA Logo"
      >
        <path
          d="M50 15C30.67 15 15 30.67 15 50C15 69.33 30.67 85 50 85C69.33 85 85 69.33 85 50C85 30.67 69.33 15 50 15ZM50 78C34.536 78 22 65.464 22 50C22 34.536 34.536 22 50 22C65.464 22 78 34.536 78 50C78 65.464 65.464 78 50 78Z"
          fill="currentColor"
          fillOpacity="0.2"
        />
        <path
          d="M68.5 35L44 59.5L31.5 47"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M50 10C27.9086 10 10 27.9086 10 50C10 72.0914 27.9086 90 50 90C72.0914 90 90 72.0914 90 50C90 27.9086 72.0914 10 50 10Z"
          stroke="currentColor"
          strokeWidth="6"
        />
        {/* Detalhes de circuito/cérebro */}
        <circle cx="50" cy="10" r="4" fill="currentColor" />
        <circle cx="90" cy="50" r="4" fill="currentColor" />
        <circle cx="50" cy="90" r="4" fill="currentColor" />
        <circle cx="10" cy="50" r="4" fill="currentColor" />
      </svg>
      
      {/* Tipografia */}
      <span className="font-bold tracking-tight select-none" style={{ fontSize: '1.75em', lineHeight: 1 }}>
        Gabaritando<span className="opacity-80">IA</span>
      </span>
    </div>
  );
};

export default Logo;