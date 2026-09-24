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
  style,
  ...props
}) => {
  return (
    <div
      className={clsx(
        'glass-card',
        hoverable && 'cursor-pointer',
        glow && 'border-blue-500/30',
        className
      )}
      style={{
        padding: '24px',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};
