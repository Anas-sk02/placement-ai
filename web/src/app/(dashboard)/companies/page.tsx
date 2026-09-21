'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  ExternalLink,
  Search,
  Briefcase,
  TrendingUp,
  MapPin,
  Sparkles,
  ArrowRight,
  PlusCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface CompanyInfo {
  id: string;
  name: string;
  domain?: string;
  logo_url?: string;
  career_portal_url?: string;
  typical_ctc?: string;
  roles?: string[];
  hiring_frequency?: string;
  locations?: string;
  min_cgpa?: number;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<CompanyInfo[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/companies')
      .then((res) => (res.ok ? res.json() : { companies: [] }))
      .then((data) => {
        const raw = data.companies || [];
        const formatted: CompanyInfo[] = raw.map((c: any) => ({
          id: c.id,
          name: c.name,
          domain: c.domain || `${c.name.toLowerCase().replace(/\s+/g, '')}.com`,
          logo_url: c.logo_url || '',
          career_portal_url: c.career_portal_url || `https://${c.domain || 'google.com'}`,
          typical_ctc: c.typical_ctc || '₹12 - 25 LPA',
          roles: c.roles && c.roles.length > 0 ? c.roles : ['Software Engineer', 'Graduate Trainee'],
          hiring_frequency: c.hiring_frequency || 'Annual Campus Drive',
          locations: c.locations || 'Pan-India',
          min_cgpa: c.min_cgpa ?? 7.0,
        }));
        setCompanies(formatted);
      })
      .catch(() => setCompanies([]));
  }, []);

  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.roles && c.roles.some((r) => r.toLowerCase().includes(search.toLowerCase()))) ||
    (c.locations && c.locations.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="page-container">
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '28px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Company Directory & CTC Benchmark Hub</h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Placement packages, cutoffs, and hiring patterns for top engineering recruiters
          </p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: 12 }} />
          <input
            type="text"
            placeholder="Search company, role, or location..."
            className="input-field"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '38px', borderRadius: '999px', paddingTop: '8px', paddingBottom: '8px' }}
          />
        </div>
      </div>

      {/* Grid of Companies */}
      {filtered.length === 0 ? (
        <div
          className="glass-card"
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Building2 size={28} color="var(--primary-light)" />
          </div>

          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>
              No Companies Registered Yet
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', maxWidth: '460px', margin: '0 auto' }}>
              When placement drives are announced or notices are ingested, participating companies will populate this directory.
            </p>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '20px',
          }}
        >
        {filtered.map((company) => (
          <div
            key={company.id}
            className="glass-card"
            style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {/* Company Title */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Building2 size={22} color="var(--primary-light)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 700 }}>{company.name}</h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{company.domain}</div>
                </div>
              </div>

              <Badge variant="eligible" style={{ fontSize: '11px' }}>
                {company.typical_ctc}
              </Badge>
            </div>

            {/* Metrics */}
            <div
              style={{
                backgroundColor: 'rgba(10, 14, 26, 0.6)',
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                fontSize: '12.5px',
              }}
            >
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'block' }}>Min Cutoff</span>
                <strong style={{ color: 'var(--status-info)' }}>{company.min_cgpa} CGPA</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'block' }}>Hiring Drive</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{company.hiring_frequency}</span>
              </div>
            </div>

            {/* Roles */}
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Target Placement Roles:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {company.roles.map((r) => (
                  <span
                    key={r}
                    style={{
                      fontSize: '11px',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(99, 102, 241, 0.1)',
                      color: 'var(--text-secondary)',
                      border: '1px solid rgba(99, 102, 241, 0.2)',
                    }}
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>

            {/* Location */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <MapPin size={14} />
              <span>{company.locations}</span>
            </div>

            {/* Footer */}
            <div style={{ paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end' }}>
              <a href={company.career_portal_url} target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" size="sm" rightIcon={<ExternalLink size={14} />}>
                  Official Career Portal
                </Button>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
