/**
 * Zenthra Systems - n8n Automation Engine API Client
 * Provides programmatic management of workflows, executions, and prospects in n8n.
 */

const fs = require('fs');
const path = require('path');

// Load environment variables from .env
function loadEnv() {
  const envPath = path.resolve(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        process.env[key] = val;
      }
    }
  }
}

loadEnv();

const BASE_URL = process.env.N8N_BASE_URL || 'http://localhost:5678';
const API_KEY = process.env.N8N_API_KEY || '';

if (!API_KEY) {
  console.error('[!] Error: N8N_API_KEY is not defined in .env or environment.');
  process.exit(1);
}

const headers = {
  'X-N8N-API-KEY': API_KEY,
  'Content-Type': 'application/json'
};

async function apiRequest(endpoint, method = 'GET', body = null) {
  const url = `${BASE_URL}/api/v1${endpoint}`;
  const options = { method, headers };
  if (body) {
    options.body = JSON.stringify(body);
  }
  const res = await fetch(url, options);
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`n8n API Error (${res.status} ${res.statusText}): ${errorText}`);
  }
  return res.json();
}

async function listWorkflows() {
  const result = await apiRequest('/workflows');
  console.log('\n=== Zenthra n8n Active Workflows ===');
  if (!result.data || result.data.length === 0) {
    console.log('No workflows found.');
    return;
  }
  console.table(result.data.map(w => ({
    id: w.id,
    name: w.name,
    active: w.active,
    createdAt: w.createdAt,
    url: `${BASE_URL}/workflow/${w.id}`
  })));
}

async function deployWorkflow(filePath) {
  const absPath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(absPath)) {
    throw new Error(`Workflow file not found: ${absPath}`);
  }
  const content = JSON.parse(fs.readFileSync(absPath, 'utf8'));
  const payload = {
    name: content.name,
    nodes: content.nodes,
    connections: content.connections,
    settings: content.settings || {}
  };

  // Check if a workflow with the same name already exists
  const existingList = await apiRequest('/workflows');
  const existing = existingList.data?.find(w => w.name === payload.name);

  if (existing) {
    console.log(`[i] Updating existing workflow '${payload.name}' (ID: ${existing.id})...`);
    const updated = await apiRequest(`/workflows/${existing.id}`, 'PUT', payload);
    console.log(`[+] Successfully updated workflow: ${updated.id}`);
    console.log(`[+] Browser URL: ${BASE_URL}/workflow/${updated.id}`);
    return updated;
  } else {
    console.log(`[i] Creating new workflow '${payload.name}'...`);
    const created = await apiRequest('/workflows', 'POST', payload);
    console.log(`[+] Successfully created workflow: ${created.id}`);
    console.log(`[+] Browser URL: ${BASE_URL}/workflow/${created.id}`);
    return created;
  }
}

async function activateWorkflow(id, activate = true) {
  const endpoint = `/workflows/${id}/${activate ? 'activate' : 'deactivate'}`;
  const res = await apiRequest(endpoint, 'POST');
  console.log(`[+] Workflow ${id} ${activate ? 'activated' : 'deactivated'}.`);
  return res;
}

async function triggerWebhook(webhookPath, payload) {
  const url = `${BASE_URL}/webhook/${webhookPath}`;
  console.log(`[i] Dispatching payload to webhook: ${url}`);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const text = await res.text();
  console.log(`[+] Webhook Response (${res.status}): ${text}`);
}

async function main() {
  const [,, command, ...args] = process.argv;

  try {
    switch (command) {
      case 'list':
        await listWorkflows();
        break;
      case 'deploy':
        await deployWorkflow(args[0] || path.join(__dirname, 'zenthra_b2b_lead_intelligence.json'));
        break;
      case 'activate':
        await activateWorkflow(args[0], true);
        break;
      case 'deactivate':
        await activateWorkflow(args[0], false);
        break;
      case 'test-prospect':
        const sampleProspect = {
          company_name: "Apex Global Logistics",
          website: "https://apex-global-logistics-example.com",
          industry: "Logistics & Supply Chain",
          headcount: 220,
          country: "United States",
          decision_maker_name: "Marcus Vance",
          decision_maker_title: "Chief Financial Officer",
          decision_maker_email: "marcus.vance@apexlogistics-demo.com",
          observed_signals: "Active job opening for Power BI & Data Analyst for 45+ days; reports delayed by 3 weeks across 4 freight hubs."
        };
        await triggerWebhook(args[0] || 'zenthra-prospect-ingest', sampleProspect);
        break;
      default:
        console.log(`
Zenthra Systems n8n CLI Helper:
  node n8n_client.js list                     List all workflows
  node n8n_client.js deploy [path]            Deploy or update workflow JSON
  node n8n_client.js activate <workflowId>    Activate workflow
  node n8n_client.js deactivate <workflowId>  Deactivate workflow
  node n8n_client.js test-prospect [path]     Send sample prospect payload to webhook
`);
    }
  } catch (err) {
    console.error(`[!] Execution failed:`, err.message);
    process.exit(1);
  }
}

main();
