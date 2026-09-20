import React from 'react';
import { clsx } from 'clsx';
import { UrgencyLevelEnum, EligibilityStatusEnum } from '@/types/database.types';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'urgent' | 'eligible' | 'warning' | 'info' | 'neutral';
  urgency?: UrgencyLevelEnum;
  eligibility?: EligibilityStatusEnum;
  pulsing?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant,
  urgency,
  eligibility,
  pulsing = false,
  className,
  ...props
}) => {
  let resolvedVariant = variant || 'neutral';

  if (urgency) {
    if (urgency === 'CRITICAL' || urgency === 'HIGH') resolvedVariant = 'urgent';
    else if (urgency === 'MEDIUM') resolvedVariant = 'warning';
    else resolvedVariant = 'info';
  } else if (eligibility) {
    if (eligibility === 'ELIGIBLE') resolvedVariant = 'eligible';
    else if (eligibility === 'NOT_ELIGIBLE') resolvedVariant = 'urgent';
    else resolvedVariant = 'warning';
  }

  const isUrgentPulse = pulsing || urgency === 'CRITICAL';

  return (
    <span
      className={clsx(
        'badge',
        `badge-${resolvedVariant}`,
        isUrgentPulse && 'pulse-urgent',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
