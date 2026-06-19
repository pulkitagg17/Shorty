/**
 * Load Testing Script for Shorty Redirect Endpoint
 *
 * Simulates high-throughput traffic to the GET /:code endpoint.
 * Measures latency percentiles (P50, P95, P99) and throughput.
 *
 * Usage:
 *   npm run benchmark                   # Test default code "test123"
 *   npm run benchmark -- abc123         # Test specific code
 *
 * Requirements:
 *   - Server running on localhost:3000
 *   - Valid short code in database (or will get 404s, which is fine for baseline)
 */

const autocannon = require('autocannon');

// Parse command-line arguments
const testCode = process.argv[2] || 'test123';
const url = `http://localhost:3000/${testCode}`;

// Configuration
const CONFIG = {
  connections: 50,          // Concurrent connections
  duration: 20,             // Test duration in seconds
  rate: 500,                // Target requests per second
};

// ============================================================================
// Main Load Test
// ============================================================================

console.log('\n' + '═'.repeat(75));
console.log('🚀 SHORTY REDIRECT ENDPOINT - LOAD TEST');
console.log('═'.repeat(75));
console.log(`Target URL:    ${url}`);
console.log(`Duration:      ${CONFIG.duration}s`);
console.log(`Target Rate:   ${CONFIG.rate} req/s`);
console.log(`Connections:   ${CONFIG.connections}`);
console.log('═'.repeat(75) + '\n');

const startTime = Date.now();

const instance = autocannon(
  {
    url,
    connections: CONFIG.connections,
    duration: CONFIG.duration,
    rate: CONFIG.rate,
    // Requests configuration
    requests: [
      {
        path: `/${testCode}`,
        method: 'GET',
      },
    ],
  },
  handleResults
);

/**
 * Handle test completion and display results
 */
function handleResults(err, result) {
  const elapsedMs = Date.now() - startTime;

  if (err) {
    console.error('❌ Test Error:', err.message);
    console.error(err);
    process.exit(1);
  }

  displayResultsTable(result, elapsedMs);
}

/**
 * Display formatted results table
 */
function displayResultsTable(result, elapsedMs) {
  const lat = result.latency;

  console.log('═'.repeat(75));
  console.log('📊 RESULTS');
  console.log('═'.repeat(75));

  // Throughput metrics
  console.log('\n📈 Throughput Metrics:');
  logMetric('  Total Requests', `${result.requests.total.toLocaleString()}`);
  logMetric('  Avg Throughput', `${result.requests.average.toFixed(2)} req/s`);
  logMetric('  Sustained Throughput', `${(result.throughput.total / elapsedMs * 1000).toFixed(0)} req/s`);
  logMetric('  Total Data', `${(result.throughput.total / 1024 / 1024).toFixed(2)} MB`);
  logMetric('  Avg Bandwidth', `${(result.throughput.average / 1024).toFixed(2)} KB/s`);

  // Latency metrics (core performance indicators)
  console.log('\n⏱️  Latency Metrics (ms):');
  logMetric('  P50 (Median)', `${lat.p50}`, '✓');
  logMetric('  P95 (95th)', `${lat.p95}`);
  logMetric('  P99 (99th)', `${lat.p99}`);
  logMetric('  Min', `${lat.min}`);
  logMetric('  Max', `${lat.max}`);
  logMetric('  Mean', `${lat.mean.toFixed(2)}`);

  // Health metrics
  console.log('\n🏥 Health Metrics:');
  const errorStatus = result.errors === 0 ? '✅ 0' : `❌ ${result.errors}`;
  logMetric('  Errors', errorStatus);
  logMetric('  Timeouts', result.timeouts === 0 ? '✅ 0' : `⚠️  ${result.timeouts}`);
  logMetric('  Success Rate', `${((result.requests.total - result.errors) / result.requests.total * 100).toFixed(2)}%`);

  // Test metadata
  console.log('\n📋 Test Metadata:');
  logMetric('  Actual Duration', `${elapsedMs}ms`);
  logMetric('  2xx Responses', result.statusCodeStats?.['2xx'] || 0);
  logMetric('  3xx Responses', result.statusCodeStats?.['3xx'] || 0);
  logMetric('  4xx Responses', result.statusCodeStats?.['4xx'] || 0);
  logMetric('  5xx Responses', result.statusCodeStats?.['5xx'] || 0);

  console.log('\n' + '═'.repeat(75));

  // Final verdict
  const passed = result.errors === 0 && lat.p99 < 100; // P99 < 100ms is good for redirect
  const verdict = passed ? '✅ PASSED' : '⚠️  MARGINAL';
  console.log(`${verdict} - Load test complete\n`);

  // Provide recommendations
  if (result.errors > 0) {
    console.warn('⚠️  Errors detected. Ensure:');
    console.warn('   - Server is running (http://localhost:3000/health/live)');
    console.warn('   - Database and Redis are healthy');
    console.warn('   - Short code exists in database or adjust test\n');
  }

  if (lat.p99 > 50) {
    console.warn('⚠️  P99 latency elevated. Consider:');
    console.warn('   - Checking database query performance');
    console.warn('   - Verifying Redis cache hit rate');
    console.warn('   - Monitoring CPU/memory usage\n');
  }

  process.exit(result.errors === 0 ? 0 : 1);
}

/**
 * Helper: Log metric with consistent formatting
 */
function logMetric(label, value, badge = '') {
  const padding = 25;
  const badgeStr = badge ? ` ${badge}` : '';
  console.log(`${label.padEnd(padding)} : ${value}${badgeStr}`);
}

/**
 * Handle process termination gracefully
 */
process.on('SIGINT', () => {
  console.log('\n⏸️  Test interrupted');
  process.exit(0);
});
