import fs from 'node:fs';
import path from 'node:path';
import { runAgent } from '../agent/graph.js';
import { env } from '../config.js';
import { getDb } from '../db/index.js';

const QUERY_POOL = [
  'What are the eligibility criteria and income limits for Need Based Financial Assistance?',
  'fees maaf hoti hai kya IIM Bodh Gaya me?',
  'When is the deadline to submit need based aid application?',
  'What is the validity period of the government income certificate?',
  'What are the Director Merit Scholarship rules and minimum CGPA?',
  'How do I apply for SBI Scholar Education Loan?',
  'Who do I contact if I am facing severe financial hardship?',
  'Can I pay tuition fees in multiple installments?',
  'What documents are required for parent income verification?',
  'Where is the Accounts Office located?',
];

export async function runLoadTest(totalQueries = 200, concurrency = 5) {
  console.log('=====================================================');
  console.log(` Starting Sahayata Load Test: ${totalQueries} queries (concurrency ${concurrency})`);
  console.log('=====================================================');

  getDb();
  const startOverall = Date.now();
  const latencies: number[] = [];
  let successCount = 0;
  let errorCount = 0;
  let totalCostInr = 0;

  let currentIdx = 0;

  async function worker() {
    while (currentIdx < totalQueries) {
      const qIndex = currentIdx++;
      const query = QUERY_POOL[qIndex % QUERY_POOL.length];
      const start = Date.now();

      try {
        const res = await runAgent({ input: query, userRole: 'student' });
        const dur = Date.now() - start;
        latencies.push(dur);
        totalCostInr += res.inrCost;
        successCount++;
      } catch (err) {
        errorCount++;
      }

      if (qIndex % 25 === 0 || qIndex === totalQueries - 1) {
        console.log(`[LoadTest] Processed ${qIndex + 1}/${totalQueries} queries...`);
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);

  const totalDurationMs = Date.now() - startOverall;
  const throughputQps = parseFloat(((totalQueries / totalDurationMs) * 1000).toFixed(2));

  latencies.sort((a, b) => a - b);
  const p50 = latencies[Math.floor(latencies.length * 0.50)] || 0;
  const p90 = latencies[Math.floor(latencies.length * 0.90)] || 0;
  const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
  const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;
  const mean = Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);

  console.log('\n--- LOAD TEST RESULTS ---');
  console.table([
    { Metric: 'Total Queries Executed', Value: totalQueries },
    { Metric: 'Total Duration', Value: `${(totalDurationMs / 1000).toFixed(2)}s` },
    { Metric: 'Throughput', Value: `${throughputQps} QPS` },
    { Metric: 'Success Rate', Value: `${Math.round((successCount / totalQueries) * 100)}%` },
    { Metric: 'Mean Latency', Value: `${mean}ms` },
    { Metric: 'p50 Latency', Value: `${p50}ms` },
    { Metric: 'p90 Latency', Value: `${p90}ms` },
    { Metric: 'p95 Latency', Value: `${p95}ms` },
    { Metric: 'p99 Latency', Value: `${p99}ms` },
    { Metric: 'Total INR Cost', Value: `₹${totalCostInr.toFixed(4)}` },
  ]);

  // Export to /reports/loadtest_report.html
  const reportsDir = env.REPORTS_DIR;
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Sahayata Load Test Report | IIM Bodh Gaya</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 960px; margin: 40px auto; color: #0b0c0c; line-height: 1.5; padding: 0 20px; }
    h1 { border-bottom: 4px solid #9C2720; padding-bottom: 12px; }
    table { width: 100%; border-collapse: collapse; margin: 24px 0; }
    th, td { border: 1px solid #b1b4b6; padding: 10px; text-align: left; }
    th { background: #f3f2f1; }
    .badge-pass { background: #cce2d8; color: #005a30; font-weight: bold; padding: 3px 8px; }
  </style>
</head>
<body>
  <h1>IIM Bodh Gaya – Sahayata Load & Stress Test Report</h1>
  <p><strong>Generated:</strong> ${new Date().toLocaleString('en-IN')}</p>
  <p><strong>Workload:</strong> ${totalQueries} simulated concurrent student inquiries.</p>
  
  <h2>Performance Summary</h2>
  <table>
    <tr><th>Performance Metric</th><th>Result</th><th>Target SLA</th></tr>
    <tr><td>Total Inquiries Processed</td><td><strong>${totalQueries}</strong></td><td>200</td></tr>
    <tr><td>Overall Duration</td><td>${(totalDurationMs / 1000).toFixed(2)} seconds</td><td>&lt; 600s</td></tr>
    <tr><td>System Throughput</td><td><strong>${throughputQps} queries/second</strong></td><td>&gt; 5.0 QPS</td></tr>
    <tr><td>Success Rate</td><td><span class="badge-pass">${Math.round((successCount / totalQueries) * 100)}%</span></td><td>&ge; 99%</td></tr>
    <tr><td>Mean Latency</td><td>${mean}ms</td><td>&lt; 1000ms</td></tr>
    <tr><td>p50 Latency (Median)</td><td>${p50}ms</td><td>&lt; 800ms</td></tr>
    <tr><td>p90 Latency</td><td>${p90}ms</td><td>&lt; 1200ms</td></tr>
    <tr><td>p95 Latency</td><td><strong>${p95}ms</strong></td><td>&lt; 1500ms</td></tr>
    <tr><td>p99 Latency</td><td>${p99}ms</td><td>&lt; 2000ms</td></tr>
    <tr><td>Total Token Expenditure</td><td>&#8377;${totalCostInr.toFixed(4)}</td><td>&lt; &#8377;1.00</td></tr>
  </table>
</body>
</html>
  `.trim();

  const htmlPath = path.join(reportsDir, 'loadtest_report.html');
  fs.writeFileSync(htmlPath, htmlContent, 'utf8');
  console.log(`[LoadTest] Saved HTML load test report to: ${htmlPath}`);

  return { totalQueries, totalDurationMs, throughputQps, p95, mean, successCount, errorCount, totalCostInr };
}

// Direct CLI invocation
if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes('loadtest')) {
  runLoadTest(200, 5).catch((err) => {
    console.error('[LoadTest] Error executing load test:', err);
    process.exit(1);
  });
}
