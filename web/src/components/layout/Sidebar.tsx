'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  LogOut,
} from 'lucide-react';
import { useStudentProfile } from '@/lib/hooks/useStudentProfile';
import { createClient } from '@/lib/supabase/client';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Telegram Feed', href: '/telegram', icon: Send, badge: 'Live' },
  { name: 'Placement Notices', href: '/insights', icon: Sparkles },
  { name: 'Deadlines', href: '/deadlines', icon: CalendarClock },
  { name: 'Applications', href: '/applications', icon: KanbanSquare },
  { name: 'Company Directory', href: '/companies', icon: GraduationCap },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Student Profile', href: '/profile', icon: UserCheck },
  { name: 'Placement Assistant', href: '/assistant', icon: BotMessageSquare },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useStudentProfile();

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    } catch {
      router.push('/login');
    }
  };

  const displayName = profile?.full_name || 'My Account';
  const displaySubtitle = `${profile?.degree || 'B.Tech'} ${profile?.branch || 'CSE'} • ${profile?.graduation_year || 2026}`;
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0].toUpperCase())
    .slice(0, 2)
    .join('') || 'ST';

  return (
    <aside
      style={{
        width: '264px',
        backgroundColor: '#0a0d15',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        flexShrink: 0,
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '24px 22px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            background: 'var(--brand-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
          }}
        >
          <GraduationCap size={19} color="#ffffff" />
        </div>
        <div>
          <div
            style={{
              fontSize: '15.5px',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            PlaceMint
            <span
              style={{
                fontSize: '10px',
                fontWeight: 600,
                color: 'var(--primary-light)',
                backgroundColor: 'rgba(59, 130, 246, 0.12)',
                padding: '1px 5px',
                borderRadius: '4px',
                border: '1px solid rgba(59, 130, 246, 0.25)',
              }}
            >
              AI
            </span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>
            Campus Placement Suite
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
          gap: '3px',
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
                padding: '9px 12px',
                borderRadius: '8px',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'rgba(37, 99, 235, 0.12)' : 'transparent',
                border: isActive ? '1px solid rgba(59, 130, 246, 0.25)' : '1px solid transparent',
                fontWeight: isActive ? 600 : 450,
                fontSize: '13px',
                transition: 'all var(--transition-fast)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon
                  size={17}
                  color={isActive ? 'var(--primary-light)' : 'var(--text-muted)'}
                />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span
                  style={{
                    fontSize: '9.5px',
                    fontWeight: 600,
                    padding: '2px 6px',
                    borderRadius: '999px',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    color: 'var(--status-eligible)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Student Card with dynamic profile & sign out */}
      <div
        style={{
          padding: '14px 16px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link
            href="/profile"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              flex: 1,
              minWidth: 0,
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                backgroundColor: '#161d2f',
                border: '1px solid var(--border-medium)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '11.5px',
                color: 'var(--text-primary)',
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {displayName}
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
                {displaySubtitle}
              </div>
            </div>
          </Link>

          <button
            onClick={handleSignOut}
            title="Sign Out"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color var(--transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--status-urgent)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
};
