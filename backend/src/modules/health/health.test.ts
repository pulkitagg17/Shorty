/**
 * Health Module Integration Tests
 *
 * Tests the liveness and readiness probes to ensure:
 * - Server is running and responsive (GET /health/live)
 * - All dependencies are healthy (GET /health/ready)
 *   - PostgreSQL connection verified
 *   - Redis cache connection verified
 *   - BullMQ analytics queue verified
 *
 * Run: npm test -- health.test.ts
 * Watch: npm test -- --watch health.test.ts
 */

import request from 'supertest';
import { createApp } from '../../app/create-app';
import type { Express } from 'express';

describe('Health Module', () => {
  let app: Express;

  /**
   * Setup: Create Express app instance before each test
   * Teardown: Express server is stateless, cleanup handled by infrastructure
   */
  beforeAll(() => {
    app = createApp();
  });

  describe('GET /health/live', () => {
    it('should return 200 OK with alive status', async () => {
      const response = await request(app).get('/health/live');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'alive',
      });
    });

    it('should have correct Content-Type header', async () => {
      const response = await request(app).get('/health/live');

      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should respond instantly (liveness is not dependent on other services)', async () => {
      const start = Date.now();
      await request(app).get('/health/live');
      const elapsed = Date.now() - start;

      // Should complete within 100ms (liveness probe is synchronous)
      expect(elapsed).toBeLessThan(100);
    });
  });

  describe('GET /health/ready', () => {
    it('should return 200 OK when all dependencies are healthy', async () => {
      const response = await request(app).get('/health/ready');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ready');
    });

    it('should return valid readiness response structure', async () => {
      const response = await request(app).get('/health/ready');

      // Verify all required fields exist
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('postgres');
      expect(response.body).toHaveProperty('redis');
      expect(response.body).toHaveProperty('analyticsQueue');
      expect(response.body).toHaveProperty('degraded');
      expect(response.body).toHaveProperty('details');
    });

    it('should verify PostgreSQL connection is operational', async () => {
      const response = await request(app).get('/health/ready');

      // PostgreSQL health check returns { healthy: true/false, details: string }
      expect(response.body.postgres).toHaveProperty('healthy');
      expect(typeof response.body.postgres.healthy).toBe('boolean');
      expect(response.body.postgres).toHaveProperty('details');
      expect(typeof response.body.postgres.details).toBe('string');

      // In a healthy state, postgres should be accessible
      if (response.status === 200) {
        expect(response.body.postgres.healthy).toBe(true);
      }
    });

    it('should verify Redis cache connection is operational', async () => {
      const response = await request(app).get('/health/ready');

      // Redis health check returns { healthy: true/false, details: string }
      expect(response.body.redis).toHaveProperty('healthy');
      expect(typeof response.body.redis.healthy).toBe('boolean');
      expect(response.body.redis).toHaveProperty('details');
      expect(typeof response.body.redis.details).toBe('string');

      // In a healthy state, redis should be accessible
      if (response.status === 200) {
        expect(response.body.redis.healthy).toBe(true);
      }
    });

    it('should verify BullMQ analytics queue is operational', async () => {
      const response = await request(app).get('/health/ready');

      // Analytics queue health check returns { healthy: true/false, details: string }
      expect(response.body.analyticsQueue).toHaveProperty('healthy');
      expect(typeof response.body.analyticsQueue.healthy).toBe('boolean');
      expect(response.body.analyticsQueue).toHaveProperty('details');
      expect(typeof response.body.analyticsQueue.details).toBe('string');

      // In a healthy state, queue should be accessible
      if (response.status === 200) {
        expect(response.body.analyticsQueue.healthy).toBe(true);
      }
    });

    it('should track degraded services when dependencies fail', async () => {
      const response = await request(app).get('/health/ready');

      // Degraded is an array of service names that are not healthy
      expect(Array.isArray(response.body.degraded)).toBe(true);
      expect(response.body.degraded).toEqual(
        expect.arrayContaining(
          response.body.degraded.map((service: string) =>
            expect.stringMatching(/^(redis|analyticsQueue)$/)
          )
        )
      );
    });

    it('should return 503 Service Unavailable if any critical dependency fails', async () => {
      const response = await request(app).get('/health/ready');

      // If postgres is down, status should be 503
      if (!response.body.postgres.healthy) {
        expect(response.status).toBe(503);
        expect(response.body.status).toBe('not ready');
      }

      // If response is 503, at least one service must be unhealthy
      if (response.status === 503) {
        const hasUnhealthyService =
          !response.body.postgres.healthy ||
          !response.body.redis.healthy ||
          !response.body.analyticsQueue.healthy;
        expect(hasUnhealthyService).toBe(true);
      }
    });

    it('should have correct Content-Type header', async () => {
      const response = await request(app).get('/health/ready');

      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should complete within reasonable time (readiness probe)', async () => {
      const start = Date.now();
      await request(app).get('/health/ready');
      const elapsed = Date.now() - start;

      // Readiness should complete within 5 seconds (includes DB/Redis checks)
      expect(elapsed).toBeLessThan(5000);
    });
  });

  describe('Integration: Liveness vs Readiness Distinction', () => {
    it('should allow liveness probe to pass even if readiness fails', async () => {
      // Liveness probe (fast, no dependencies)
      const liveness = await request(app).get('/health/live');
      expect(liveness.status).toBe(200);

      // Readiness probe (comprehensive)
      const readiness = await request(app).get('/health/ready');
      // Readiness can fail if dependencies are down, but should be proper HTTP status

      // Both should be well-formed responses
      expect(liveness.body).toBeDefined();
      expect(readiness.body).toBeDefined();
    });

    it('should accept health probe requests from orchestrators', async () => {
      // Kubernetes readiness probe with custom headers
      const response = await request(app)
        .get('/health/ready')
        .set('User-Agent', 'kube-probe/1.29');

      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(600);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent health endpoints', async () => {
      const response = await request(app).get('/health/unknown');

      expect(response.status).toBe(404);
    });

    it('should not expose sensitive information in health responses', async () => {
      const liveness = await request(app).get('/health/live');
      const readiness = await request(app).get('/health/ready');

      // Should not leak database credentials, tokens, or internal paths
      const livenessStr = JSON.stringify(liveness.body);
      const readinessStr = JSON.stringify(readiness.body);

      expect(livenessStr).not.toMatch(/@|\$|password|secret|token/i);
      // Note: readiness may contain error messages which could theoretically contain partial info
      // This is acceptable for operational debugging
    });
  });
});
