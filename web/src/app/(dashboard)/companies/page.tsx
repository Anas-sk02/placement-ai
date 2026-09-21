'use client';

import React, { useState } from 'react';
import {
  Building2,
  ExternalLink,
  Search,
  Briefcase,
  TrendingUp,
  MapPin,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface CompanyInfo {
  id: string;
  name: string;
  domain: string;
  logo_url: string;
  career_portal_url: string;
  typical_ctc: string;
  roles: string[];
  hiring_frequency: string;
  locations: string;
  min_cgpa: number;
}

const COMPANIES: CompanyInfo[] = [
  {
    id: 'c-1',
    name: 'Google India',
    domain: 'google.com',
    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
    career_portal_url: 'https://careers.google.com',
    typical_ctc: '₹32 - 45 LPA',
    roles: ['Software Engineer', 'Systems Engineer', 'Application Engineer'],
    hiring_frequency: 'Annual (Campus + Off-Campus)',
    locations: 'Bengaluru, Hyderabad',
    min_cgpa: 7.0,
  },
  {
    id: 'c-2',
    name: 'Goldman Sachs',
    domain: 'goldmansachs.com',
    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/6/61/Goldman_Sachs.svg',
    career_portal_url: 'https://www.goldmansachs.com/careers',
    typical_ctc: '₹24 - 30 LPA',
    roles: ['Summer Analyst', 'Engineering Associate', 'Quant Analyst'],
    hiring_frequency: 'Annual (August - October)',
    locations: 'Bengaluru, Hyderabad',
    min_cgpa: 7.5,
  },
  {
    id: 'c-3',
    name: 'Amazon India',
    domain: 'amazon.jobs',
    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
    career_portal_url: 'https://amazon.jobs',
    typical_ctc: '₹44.5 LPA',
    roles: ['SDE-1', 'Cloud Support Associate', 'Quality Assurance Engineer'],
    hiring_frequency: 'Bi-Annual (Mass Drives)',
    locations: 'Hyderabad, Bengaluru, Chennai, Delhi',
    min_cgpa: 7.0,
  },
  {
    id: 'c-4',
    name: 'Microsoft',
    domain: 'microsoft.com',
    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg',
    career_portal_url: 'https://careers.microsoft.com',
    typical_ctc: '₹45 - 51 LPA',
    roles: ['Software Engineer (Graduate)', 'Program Manager'],
    hiring_frequency: 'Annual (Campus + Engage)',
    locations: 'Redmond, Hyderabad, Bengaluru, Noida',
    min_cgpa: 8.0,
  },
  {
    id: 'c-5',
    name: 'Uber',
    domain: 'uber.com',
    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png',
    career_portal_url: 'https://uber.com/careers',
    typical_ctc: '₹38 - 50 LPA (Intern: ₹1.6L/mo)',
    roles: ['SWE Intern', 'Backend Engineer', 'Data Engineer'],
    hiring_frequency: 'Annual (Summer Drives)',
    locations: 'Hyderabad, Bengaluru',
    min_cgpa: 8.0,
  },
  {
    id: 'c-6',
    name: 'Atlassian',
    domain: 'atlassian.com',
    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/0/01/Atlassian-Logo.png',
    career_portal_url: 'https://atlassian.com/careers',
    typical_ctc: '₹35 - 40 LPA',
    roles: ['Associate Software Engineer', 'Site Reliability Engineer'],
    hiring_frequency: 'Annual (Off-Campus)',
    locations: 'Bengaluru / Remote',
    min_cgpa: 7.5,
  },
];

export default function CompaniesPage() {
  const [search, setSearch] = useState('');

  const filtered = COMPANIES.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.roles.some((r) => r.toLowerCase().includes(search.toLowerCase())) ||
    c.locations.toLowerCase().includes(search.toLowerCase())
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
            Historical placement packages, cutoffs, and hiring patterns for top engineering recruiters
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
