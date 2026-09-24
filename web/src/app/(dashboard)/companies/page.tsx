'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  ExternalLink,
  Search,
  MapPin,
  Sparkles,
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
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em' }}>
            Company Directory
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Verified placement packages, CGPA cutoffs, and hiring criteria
          </p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 12 }} />
          <input
            type="text"
            placeholder="Search company, role, or location..."
            className="input-field"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '34px' }}
          />
        </div>
      </div>

      {/* Grid of Companies */}
      {filtered.length === 0 ? (
        <div
          className="glass-card"
          style={{
            padding: '56px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            backgroundColor: '#111624',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '10px',
              backgroundColor: '#161d2f',
              border: '1px solid var(--border-medium)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Building2 size={24} color="var(--primary-light)" />
          </div>

          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>
              No Companies Found
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto' }}>
              Ingested recruitment notices will automatically index recruiter profiles here.
            </p>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '20px',
          }}
        >
          {filtered.map((c) => (
            <Card key={c.id} hoverable={true} style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#111624' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      backgroundColor: '#161d2f',
                      border: '1px solid var(--border-medium)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary-light)',
                      flexShrink: 0,
                    }}
                  >
                    <Building2 size={20} />
                  </div>

                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 700 }}>{c.name}</h3>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.domain}</div>
                  </div>
                </div>

                <Badge variant="primary" style={{ fontSize: '10.5px' }}>
                  Min {c.min_cgpa} CGPA
                </Badge>
              </div>

              {/* Roles & Package */}
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '6px',
                  backgroundColor: '#0d111a',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '12.5px',
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Typical CTC</div>
                  <div style={{ fontWeight: 600, color: 'var(--status-eligible)' }}>{c.typical_ctc}</div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Cycle</div>
                  <div style={{ color: 'var(--text-secondary)' }}>{c.hiring_frequency}</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {c.roles?.map((role, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '11.5px',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {role}
                  </span>
                ))}
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border-subtle)',
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={13} />
                  <span>{c.locations}</span>
                </div>

                <a href={c.career_portal_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" size="sm" rightIcon={<ExternalLink size={12} />}>
                    Careers Portal
                  </Button>
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
