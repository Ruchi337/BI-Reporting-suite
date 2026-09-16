import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { OPENAPI_SPEC } from '../src/docs/openapiSpec';
import { runAutonomousStoreAudit } from '../src/utils/aiAgentWorkflow';
import { INITIAL_PRODUCTS } from '../src/mockData';

describe('Milestone 4: Core API & Workflow Unit Tests', () => {

  describe('1. OpenAPI 3.0 Documentation & Schemas', () => {
    it('should have valid OpenAPI 3.0 info metadata', () => {
      assert.equal(OPENAPI_SPEC.openapi, '3.0.3');
      assert.ok(OPENAPI_SPEC.info.title.includes('ShopSense'));
      assert.ok(OPENAPI_SPEC.info.version);
    });

    it('should document critical enterprise paths', () => {
      const requiredPaths = [
        '/api/health',
        '/api/admin/overview',
        '/api/products',
        '/api/vendors',
        '/api/agent/vendor-audit',
        '/api/analytics/summary'
      ];
      for (const path of requiredPaths) {
        assert.ok(
          (OPENAPI_SPEC.paths as Record<string, unknown>)[path],
          `Expected OpenAPI specification to document path: ${path}`
        );
      }
    });

    it('should specify request and response schemas for Agent Workflow', () => {
      const auditEndpoint = (OPENAPI_SPEC.paths as any)['/api/agent/vendor-audit'];
      assert.ok(auditEndpoint.post);
      assert.ok(auditEndpoint.post.requestBody);
      assert.ok(auditEndpoint.post.responses['200']);
    });
  });

  describe('2. Autonomous AI Agent Store Audit (LangGraph/Agentic Loop)', () => {
    it('should execute multi-node agent audit and identify overstock anomalies', () => {
      // Mock test products with high stock to trigger the strategic discount rule
      const testProducts = [
        ...INITIAL_PRODUCTS,
        {
          id: 'test-overstock-01',
          name: 'Thermal Travel Mug 24oz',
          category: 'Sports & Outdoors',
          price: 35.0,
          cost: 12.0,
          stock: 85, // High inventory
          minThreshold: 15,
          leadTimeDays: 7,
          supplier: 'AeroAcoustics Global',
          rating: 4.6,
          reviewCount: 12,
          tags: [],
          features: [],
          salesLast30Days: 20,
          sku: 'SKU-TEST-01',
          image: '',
          description: ''
        }
      ];

      const result = runAutonomousStoreAudit(
        'vendor-001',
        'Alexander Thorne',
        'alex.thorne@aeroacoustics.com',
        'AeroAcoustics Global',
        testProducts
      );

      assert.equal(result.vendorId, 'vendor-001');
      assert.ok(result.trace.length >= 4, 'Expected trace to have executed all agent nodes');
      assert.ok(result.risks.length > 0, 'Agent should identify risks');

      // Verify the proactive discount recommendation matches user prompt
      const discountAction = result.actions.find(a => a.actionType === 'DISCOUNT');
      assert.ok(discountAction, 'Agent must recommend discount on high inventory / dropping demand item');
      assert.ok(discountAction.rationale.includes('discount'));
      assert.ok(discountAction.newPrice! < discountAction.originalPrice);
    });

    it('should generate properly formatted proactive email advisory', () => {
      const result = runAutonomousStoreAudit(
        'vendor-001',
        'Alexander Thorne',
        'alex.thorne@aeroacoustics.com',
        'AeroAcoustics Global',
        INITIAL_PRODUCTS
      );

      assert.ok(result.email.subject.includes('Weekly Strategic Advisory'));
      assert.equal(result.email.recipientEmail, 'alex.thorne@aeroacoustics.com');
      assert.ok(result.email.htmlBody.includes('Primary Action Item'));
      assert.ok(result.email.markdownSummary.includes('Projected Financial Recovery'));
    });
  });

  describe('3. Product Catalog & Inventory Invariants', () => {
    it('should enforce positive product pricing and valid inventory stock levels', () => {
      for (const product of INITIAL_PRODUCTS) {
        assert.ok(product.price > 0, `Product ${product.id} price must be > 0`);
        assert.ok(product.stock >= 0, `Product ${product.id} stock must be non-negative`);
        assert.ok(product.minThreshold >= 0, `Product ${product.id} minThreshold must be >= 0`);
      }
    });

    it('should accurately detect low stock alerts', () => {
      const lowStockItems = INITIAL_PRODUCTS.filter(p => p.stock <= p.minThreshold);
      assert.ok(lowStockItems.length > 0, 'At least one item should trigger low stock alert for testing');
    });
  });

});
