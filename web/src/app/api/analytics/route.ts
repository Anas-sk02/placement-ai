import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export interface PlacementAnalyticsData {
  funnel: {
    total_discovered_notices: number;
    saved_applications: number;
    submitted_applications: number;
    online_assessments: number;
    interviews_scheduled: number;
    offers_received: number;
  };
  compensation_tiers: {
    super_dream: number; // > 30 LPA
    dream: number;       // 15 - 30 LPA
    standard: number;    // < 15 LPA
  };
  opportunity_type_breakdown: {
    job: number;
    internship: number;
    hackathon: number;
    campus_drive: number;
  };
  metrics: {
    average_ctc_lpa: number;
    highest_ctc_lpa: number;
    eligibility_qualification_rate: number;
    deadline_adherence_rate: number;
  };
}

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Query applications scoped to user
    const { data: apps } = await (supabase.from('applications') as any)
      .select('status')
      .eq('user_id', user?.id || '00000000-0000-0000-0000-000000000000');

    // Query active insights
    const { data: insights } = await (supabase.from('ai_insights') as any)
      .select('opportunity_type, salary_or_stipend');

    const insightList = insights || [];
    const totalNotices = insightList.length;
    const appList = apps || [];

    const savedCount = appList.filter((a: any) => a.status === 'SAVED').length;
    const appliedCount = appList.filter((a: any) => a.status === 'APPLIED').length;
    const assessmentCount = appList.filter((a: any) => a.status === 'ASSESSMENT').length;
    const interviewCount = appList.filter((a: any) => a.status === 'INTERVIEW').length;
    const selectedCount = appList.filter((a: any) => a.status === 'SELECTED').length;

    // Categorize by opportunity type
    const jobCount = insightList.filter((i: any) => i.opportunity_type === 'FULL_TIME' || i.opportunity_type === 'CAMPUS_DRIVE').length;
    const internCount = insightList.filter((i: any) => i.opportunity_type === 'INTERNSHIP').length;
    const hackathonCount = insightList.filter((i: any) => i.opportunity_type === 'HACKATHON').length;
    const otherCount = insightList.filter((i: any) => i.opportunity_type === 'OTHER').length;

    const data: PlacementAnalyticsData = {
      funnel: {
        total_discovered_notices: totalNotices,
        saved_applications: savedCount,
        submitted_applications: appliedCount,
        online_assessments: assessmentCount,
        interviews_scheduled: interviewCount,
        offers_received: selectedCount,
      },
      compensation_tiers: {
        super_dream: 0,
        dream: 0,
        standard: 0,
      },
      opportunity_type_breakdown: {
        job: jobCount,
        internship: internCount,
        hackathon: hackathonCount,
        campus_drive: otherCount,
      },
      metrics: {
        average_ctc_lpa: 0,
        highest_ctc_lpa: 0,
        eligibility_qualification_rate: totalNotices > 0 ? 100 : 0,
        deadline_adherence_rate: 100,
      },
    };

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Analytics query failed' }, { status: 500 });
  }
}
