export interface DashboardResponse {
  tenant: string;
  brand: {
    id: string;
    name: string;
  };
  summary: Record<string, number>;
  jobs: Array<{
    id: string;
    timestamp: string;
    mode: string;
    processed: number;
    skipped: number;
    status: string;
  }>;
}

export interface RealDataSummary {
  clients_active: number;
  monthly_revenue: number;
  manual_hours: number;
  operational_cost: number;
  pending_cuts: number;
  automation_rate: number;
  data_source: string;
  csv_file: string;
  last_updated: string;
  total_debt: number;
  recoverable_today: number;
  // Hacer campos compatibles con Record<string, number> del código existente
  [key: string]: string | number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:9000/api";

export async function fetchDashboard(): Promise<DashboardResponse> {
  const url = `${API_BASE}/dashboard`;
  const res = await fetch(url, { next: { revalidate: 10 } });
  if (!res.ok) throw new Error("Failed to load dashboard");
  return res.json();
}

export async function fetchJobs(): Promise<DashboardResponse["jobs"]> {
  const url = `${API_BASE}/jobs`;
  const res = await fetch(url, { next: { revalidate: 10 } });
  if (!res.ok) throw new Error("Failed to load jobs");
  return res.json();
}

export async function fetchRealDataSummary(): Promise<RealDataSummary> {
  const url = `${API_BASE}/dashboard/summary-real`;
  const res = await fetch(url, { next: { revalidate: 10 } });
  if (!res.ok) throw new Error("Failed to load real data summary");
  return res.json();
}

export interface BusinessMetric {
  id: string;
  icon: string;
  title: string;
  value: number;
  format: "currency" | "number" | "percentage" | "hours";
  tooltip: string;
  trend: "positive" | "negative" | "neutral" | "urgent";
  actionable: boolean;
  action_text?: string;
}

export interface BusinessAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  urgent: boolean;
  estimated_time: string;
  potential_recovery: number;
}

export interface BusinessMetricsResponse {
  metrics: BusinessMetric[];
  actions: BusinessAction[];
  summary: {
    total_recoverable: number;
    immediate_action: number;
    time_saved: number;
    cost_saved: number;
    roi_days: number;
  };
}

export async function fetchBusinessMetrics(): Promise<BusinessMetricsResponse> {
  const url = `${API_BASE}/dashboard/business-metrics`;
  const res = await fetch(url, { next: { revalidate: 10 } });
  if (!res.ok) throw new Error("Failed to load business metrics");
  return res.json();
}
