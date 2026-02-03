import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', className, ...props }) => {
  const base = "flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-6 font-bold leading-normal transition-all active:scale-95";
  const variants = {
    primary: "bg-primary text-[#112217] hover:bg-[#16cc52] shadow-sm",
    secondary: "bg-gray-200 dark:bg-[#244730] text-[#112116] dark:text-white hover:opacity-90",
    ghost: "bg-transparent text-gray-500 dark:text-[#93c8a5] hover:bg-black/5 dark:hover:bg-white/5 border border-dashed border-gray-300 dark:border-[#244730]"
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className ?? ''}`}
      {...props}
    />
  );
};
