import React from 'react';
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Home' },
  { to: '/exercises', label: 'Exercises' },
  { to: '/routines', label: 'Routines' },
  { to: '/reminders', label: 'Reminders' },
  { to: '/logs', label: 'Logs' },
  { to: '/settings', label: 'Settings' },
  { to: '/about', label: 'About' }
];

export const TopNav: React.FC = () => (
  <nav className="top-nav">
    {links.map((link) => (
      <NavLink key={link.to} to={link.to} className={({ isActive }) => (isActive ? 'active' : '')}>
        {link.label}
      </NavLink>
    ))}
  </nav>
);
