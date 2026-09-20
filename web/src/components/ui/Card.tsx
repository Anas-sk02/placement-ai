import React from 'react';
import { clsx } from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = true,
  glow = false,
  className,
  ...props
}) => {
  return (
    <div
      className={clsx(
        'glass-card',
        hoverable && 'cursor-pointer',
        glow && 'border-indigo-500/30',
        className
      )}
      style={{
        padding: '20px',
        ...props.style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};
