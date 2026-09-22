'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface OptionItem {
  value: string;
  label: string;
  count?: number;
  badge?: string;
  icon?: React.ReactNode;
}

export interface CustomSelectProps {
  options: OptionItem[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  width?: string | number;
  minWidth?: string | number;
  className?: string;
  align?: 'left' | 'right';
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select option',
  icon,
  width = 'auto',
  minWidth = '180px',
  align = 'left',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close on outside click or Escape key
  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('pointerdown', handlePointerDown);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const isSelectedActive = value !== 'ALL' && value !== '';

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: typeof width === 'number' ? `${width}px` : width,
        minWidth: typeof minWidth === 'number' ? `${minWidth}px` : minWidth,
        userSelect: 'none',
      }}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          padding: '8px 12px',
          borderRadius: '8px',
          backgroundColor: isSelectedActive
            ? 'rgba(99, 102, 241, 0.12)'
            : 'rgba(255, 255, 255, 0.04)',
          border: `1px solid ${
            isOpen
              ? 'var(--primary)'
              : isSelectedActive
              ? 'rgba(99, 102, 241, 0.4)'
              : 'var(--border-medium)'
          }`,
          boxShadow: isOpen
            ? '0 0 15px rgba(99, 102, 241, 0.25)'
            : 'none',
          color: isSelectedActive ? '#ffffff' : 'var(--text-primary)',
          fontSize: '13px',
          fontWeight: isSelectedActive ? 600 : 400,
          cursor: 'pointer',
          transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
          outline: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
          {icon && (
            <span style={{ color: isSelectedActive ? 'var(--primary-light)' : 'var(--text-muted)', display: 'flex' }}>
              {icon}
            </span>
          )}
          <span
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '180px',
            }}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.count !== undefined && (
            <span
              style={{
                fontSize: '11px',
                padding: '1px 6px',
                borderRadius: '10px',
                backgroundColor: isSelectedActive ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                color: isSelectedActive ? 'var(--primary-light)' : 'var(--text-muted)',
                fontWeight: 600,
              }}
            >
              {selectedOption.count}
            </span>
          )}
        </div>

        <ChevronDown
          size={15}
          style={{
            color: isSelectedActive ? 'var(--primary-light)' : 'var(--text-muted)',
            transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            flexShrink: 0,
          }}
        />
      </button>

      {/* Glassmorphic Dropdown Popover */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            [align]: 0,
            zIndex: 99999,
            minWidth: '220px',
            maxWidth: '340px',
            maxHeight: '300px',
            overflowY: 'auto',
            backgroundColor: '#0c1024',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            borderRadius: '10px',
            boxShadow: '0 20px 50px -10px rgba(0, 0, 0, 0.95), 0 0 20px rgba(99, 102, 241, 0.2)',
            backdropFilter: 'blur(20px)',
            padding: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
            animation: 'dropdownFadeIn 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {options.map((opt) => {
            const isOptSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  padding: '9px 12px',
                  borderRadius: '7px',
                  fontSize: '13px',
                  fontWeight: isOptSelected ? 600 : 400,
                  color: isOptSelected ? '#ffffff' : 'var(--text-secondary)',
                  backgroundColor: isOptSelected
                    ? 'rgba(99, 102, 241, 0.25)'
                    : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isOptSelected) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                    e.currentTarget.style.color = '#ffffff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isOptSelected) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                  {opt.icon && (
                    <span style={{ color: isOptSelected ? 'var(--primary-light)' : 'var(--text-muted)', display: 'flex' }}>
                      {opt.icon}
                    </span>
                  )}
                  <span
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {opt.label}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  {opt.count !== undefined && (
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '2px 7px',
                        borderRadius: '10px',
                        backgroundColor: isOptSelected
                          ? 'rgba(99, 102, 241, 0.4)'
                          : 'rgba(255, 255, 255, 0.08)',
                        color: isOptSelected ? '#ffffff' : 'var(--text-muted)',
                        fontWeight: 600,
                      }}
                    >
                      {opt.count}
                    </span>
                  )}
                  {isOptSelected && <Check size={14} color="var(--primary-light)" />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
