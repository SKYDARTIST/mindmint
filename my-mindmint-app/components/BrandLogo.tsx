import React from 'react';

interface BrandLogoProps {
  variant?: 'icon' | 'full' | 'stacked';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const BrandLogo: React.FC<BrandLogoProps> = ({ variant = 'full', className = '', size = 'md' }) => {
  
  // Size mappings
  const dimensions = {
    sm: { w: 24, h: 24, text: 'text-base' },
    md: { w: 32, h: 32, text: 'text-xl' },
    lg: { w: 48, h: 48, text: 'text-3xl' },
    xl: { w: 64, h: 64, text: 'text-4xl' },
  };

  const { w, h, text } = dimensions[size];

  // The Abstract "MindMint" Symbol (Node M)
  const LogoIcon = () => (
    <svg 
      width={w} 
      height={h} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
    >
      {/* Background shape */}
      <rect x="2" y="2" width="28" height="28" rx="8" className="fill-[#6E56CF] dark:fill-[#7C66DC]" />
      
      {/* The "M" Node Construction */}
      <path 
        d="M10 22V12C10 11 11 10 12 10H13L16 16L19 10H20C21 10 22 11 22 12V22" 
        stroke="white" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      
      {/* The "Mint" Spark/Dot */}
      <circle cx="24" cy="8" r="3" className="fill-[#10B981] dark:fill-[#34D399]" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
    </svg>
  );

  if (variant === 'icon') {
    return <div className={className}><LogoIcon /></div>;
  }

  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center gap-3 ${className}`}>
        <LogoIcon />
        <span className={`${text} font-bold tracking-tight text-gray-900 dark:text-white font-satoshi`}>
          MindMint
        </span>
      </div>
    );
  }

  // Default: Full (Row)
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoIcon />
      <span className={`${text} font-bold tracking-tight text-gray-900 dark:text-white font-satoshi`}>
        MindMint
      </span>
    </div>
  );
};

export default BrandLogo;