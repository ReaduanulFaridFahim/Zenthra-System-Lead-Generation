/**
 * Zenthra Systems - Power BI Star Schema Dataset Generator
 * Generates Kimball-compliant dimension and fact tables in CSV format for executive reporting.
 */

const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.resolve(__dirname, 'datasets');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function writeCsv(filename, headers, rows) {
  const filePath = path.join(OUTPUT_DIR, filename);
  const content = [
    headers.join(','),
    ...rows.map(r => r.map(val => {
      if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    }).join(','))
  ].join('\n');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`[+] Generated: datasets/${filename} (${rows.length} records)`);
}

function generateDatasets() {
  console.log('[*] Generating Zenthra Systems Power BI Star Schema Datasets...');

  // 1. dim_services.csv
  const servicesHeaders = ['service_id', 'service_name', 'service_category', 'default_wedge_name', 'target_acv_usd', 'target_margin_pct'];
  const servicesRows = [
    ['SRV_01', 'Microsoft Power BI Development', 'Business Intelligence', '5-Day Executive KPI Sprint', 12500, 68],
    ['SRV_02', 'AI Agents & Business Automation', 'Automation', 'Workflow Bottleneck Audit', 38000, 65],
    ['SRV_03', 'AI Development & Generative AI', 'Artificial Intelligence', 'Private Enterprise RAG Proof-of-Concept', 55000, 70],
    ['SRV_04', 'Modern Web Development', 'Software Engineering', 'Technical Architecture Sprint', 45000, 62],
    ['SRV_05', 'Data Analytics & Pipelines', 'Data Engineering', 'Data Warehouse Health Check', 28000, 64],
    ['SRV_06', 'Business Analysis & Process Mapping', 'Consulting', 'Operational Process Mapping Sprint', 15000, 72]
  ];
  writeCsv('dim_services.csv', servicesHeaders, servicesRows);

  // 2. dim_dates.csv (Rolling 90-day calendar)
  const datesHeaders = ['date_key', 'calendar_date', 'year', 'quarter', 'month_name', 'month_number', 'day_of_week', 'is_weekend'];
  const datesRows = [];
  const startDate = new Date('2026-09-01');
  const endDate = new Date('2026-12-31');

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dateKey = `${yyyy}${mm}${dd}`;
    const calDate = `${yyyy}-${mm}-${dd}`;
    const quarter = `Q${Math.floor(d.getMonth() / 3) + 1}`;
    const monthName = d.toLocaleString('en-US', { month: 'short' });
    const dayOfWeek = d.toLocaleString('en-US', { weekday: 'short' });
    const isWeekend = d.getDay() === 0 || d.getDay() === 6 ? 1 : 0;

    datesRows.push([dateKey, calDate, yyyy, quarter, monthName, d.getMonth() + 1, dayOfWeek, isWeekend]);
  }
  writeCsv('dim_dates.csv', datesHeaders, datesRows);

  // 3. dim_accounts.csv
  const accountsHeaders = ['account_id', 'company_name', 'country', 'industry', 'headcount', 'revenue_tier', 'lead_tier', 'initial_lead_score'];
  const accountsRows = [
    ['ACC_001', 'Apex Global Logistics Inc.', 'United States', 'Logistics & Supply Chain', 240, '$25M-$50M', 'Tier A', 95],
    ['ACC_002', 'Meridian Capital Partners LLP', 'United Kingdom', 'Fintech & Wealth Management', 120, '$25M-$50M', 'Tier A', 88],
    ['ACC_003', 'Al-Mansoor Trading & Distribution', 'United Arab Emirates', 'Logistics & Distribution', 380, '$50M-$100M', 'Tier A', 90],
    ['ACC_004', 'Strata Cloud Solutions', 'United States', 'SaaS & Enterprise Software', 85, '$10M-$25M', 'Tier A', 92],
    ['ACC_005', 'Synapse Healthcare Systems GmbH', 'Germany', 'Healthcare Technology', 160, '$25M-$50M', 'Tier B', 78],
    ['ACC_006', 'Vanguard Freight Network', 'United States', 'Logistics & Distribution', 210, '$50M-$100M', 'Tier A', 85],
    ['ACC_007', 'Kestrel Legal Technologies', 'United Kingdom', 'Legal & Professional Services', 65, '$10M-$25M', 'Tier B', 74],
    ['ACC_008', 'Nordic Precision Manufacturing', 'Sweden', 'Manufacturing', 310, '$50M-$100M', 'Tier A', 82],
    ['ACC_009', 'Oasis Retail Logistics FZ-LLC', 'United Arab Emirates', 'Logistics & Supply Chain', 190, '$25M-$50M', 'Tier A', 89],
    ['ACC_010', 'Beacon Financial Analytics', 'United States', 'Financial Services', 95, '$10M-$25M', 'Tier B', 76]
  ];
  writeCsv('dim_accounts.csv', accountsHeaders, accountsRows);

  // 4. fact_pipeline.csv
  const pipelineHeaders = [
    'deal_id', 'account_id', 'service_id', 'created_date_key', 'close_date_key',
    'deal_stage', 'deal_value_usd', 'win_probability', 'weighted_value_usd',
    'is_closed_won', 'is_closed_lost', 'sales_cycle_days', 'monthly_retainer_usd'
  ];
  const pipelineRows = [
    ['DEAL_101', 'ACC_001', 'SRV_01', '20261005', '20261020', 'Closed Won', 12500, 1.00, 12500, 1, 0, 15, 3500],
    ['DEAL_102', 'ACC_004', 'SRV_03', '20261012', '20261115', 'Closed Won', 55000, 1.00, 55000, 1, 0, 34, 6500],
    ['DEAL_103', 'ACC_003', 'SRV_02', '20261018', '20261130', 'Proposal Submitted', 38000, 0.60, 22800, 0, 0, 25, 4500],
    ['DEAL_104', 'ACC_002', 'SRV_01', '20261022', '20261125', 'Technical Scope Confirmed', 15000, 0.50, 7500, 0, 0, 18, 3500],
    ['DEAL_105', 'ACC_006', 'SRV_01', '20261101', '20261120', 'Discovery Meeting Booked', 12500, 0.30, 3750, 0, 0, 7, 3500],
    ['DEAL_106', 'ACC_009', 'SRV_02', '20261103', '20261210', 'Discovery Meeting Booked', 42000, 0.25, 10500, 0, 0, 5, 5000],
    ['DEAL_107', 'ACC_005', 'SRV_04', '20260915', '20261010', 'Closed Lost', 45000, 0.00, 0, 0, 1, 25, 0],
    ['DEAL_108', 'ACC_008', 'SRV_01', '20261028', '20261118', 'Proposal Submitted', 28000, 0.60, 16800, 0, 0, 14, 3500]
  ];
  writeCsv('fact_pipeline.csv', pipelineHeaders, pipelineRows);

  // 5. fact_activities.csv
  const activitiesHeaders = ['activity_id', 'date_key', 'account_id', 'activity_type', 'channel', 'status', 'touches_count'];
  const activitiesRows = [
    ['ACT_01', '20261005', 'ACC_001', 'Cold Email Dispatched', 'Email', 'Delivered', 1],
    ['ACT_02', '20261007', 'ACC_001', 'LinkedIn Connection Sent', 'LinkedIn', 'Accepted', 1],
    ['ACT_03', '20261009', 'ACC_001', 'Positive Reply Received', 'Email', 'Replied', 1],
    ['ACT_04', '20261012', 'ACC_001', 'Discovery Meeting Conducted', 'Video Call', 'Completed', 1],
    ['ACT_05', '20261012', 'ACC_004', 'Cold Email Dispatched', 'Email', 'Delivered', 1],
    ['ACT_06', '20261015', 'ACC_004', 'Positive Reply Received', 'Email', 'Replied', 1],
    ['ACT_07', '20261018', 'ACC_003', 'Cold Email Dispatched', 'Email', 'Delivered', 1],
    ['ACT_08', '20261022', 'ACC_002', 'Cold Email Dispatched', 'Email', 'Delivered', 1],
    ['ACT_09', '20261101', 'ACC_006', 'Cold Email Dispatched', 'Email', 'Delivered', 1],
    ['ACT_10', '20261103', 'ACC_009', 'Cold Email Dispatched', 'Email', 'Delivered', 1]
  ];
  writeCsv('fact_activities.csv', activitiesHeaders, activitiesRows);

  console.log('[✓] Star Schema Datasets successfully written to analytics/datasets/\n');
}

if (require.main === module) {
  generateDatasets();
}

module.exports = { generateDatasets };
