import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', className, ...props }) => (
  <button className={`btn btn-${variant} ${className ?? ''}`} {...props} />
);
