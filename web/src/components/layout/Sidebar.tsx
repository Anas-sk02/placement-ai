'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Send,
  Sparkles,
  CalendarClock,
  KanbanSquare,
  UserCheck,
  BotMessageSquare,
  Settings,
  GraduationCap,
  BarChart3,
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Telegram Groups', href: '/telegram', icon: Send, badge: 'Live' },
  { name: 'Placement Feed', href: '/insights', icon: Sparkles },
  { name: 'Deadlines', href: '/deadlines', icon: CalendarClock },
  { name: 'Applications', href: '/applications', icon: KanbanSquare },
  { name: 'Company Hub', href: '/companies', icon: GraduationCap },
  { name: 'Analytics & Prep', href: '/analytics', icon: BarChart3 },
  { name: 'Profile & Criteria', href: '/profile', icon: UserCheck },
  { name: 'AI Assistant', href: '/assistant', icon: BotMessageSquare },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: 'rgba(10, 14, 26, 0.95)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '24px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'var(--brand-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--primary-glow)',
          }}
        >
          <GraduationCap size={20} color="#ffffff" />
        </div>
        <div>
          <div
            style={{
              fontSize: '17px',
              fontWeight: 800,
              letterSpacing: '-0.3px',
              color: '#ffffff',
            }}
          >
            PlaceMint<span className="text-gradient">.AI</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Notice & Deadline Intelligence
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav
        style={{
          flex: 1,
          padding: '16px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          overflowY: 'auto',
        }}
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '10px',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'rgba(99, 102, 241, 0.14)' : 'transparent',
                border: isActive ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                fontWeight: isActive ? 600 : 500,
                fontSize: '13.5px',
                transition: 'all var(--transition-fast)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon
                  size={18}
                  color={isActive ? 'var(--primary-light)' : 'currentColor'}
                />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '999px',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    color: 'var(--status-eligible)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Student Card */}
      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'rgba(255, 255, 255, 0.015)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: 'rgba(99, 102, 241, 0.25)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '13px',
              color: 'var(--primary-light)',
            }}
          >
            AS
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              Anas Shaikh
            </div>
            <div
              style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              B.Tech CSE • 2026 Batch
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
