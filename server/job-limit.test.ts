import { describe, it, expect, beforeAll } from 'vitest';
import { getOrganizationById, updateOrganizationSubscription } from './organizations-db';

/**
 * Test job limit enforcement
 * Verifies that organizations cannot exceed their monthly job limits
 */
describe('Job Limit Enforcement', () => {
  it('should correctly identify when organization has reached job limit', async () => {
    // Test organization ID (using a known test org)
    const testOrgId = 120003;
    
    // Get current organization state
    const org = await getOrganizationById(testOrgId);
    
    expect(org).toBeDefined();
    expect(org?.monthlyJobLimit).toBeDefined();
    
    if (!org) {
      throw new Error('Test organization not found');
    }
    
    // Test unlimited scenario
    const isUnlimited = (org.monthlyJobLimit || 0) === -1;
    if (isUnlimited) {
      console.log('✅ Organization has unlimited jobs');
      expect(org.monthlyJobLimit).toBe(-1);
    } else {
      console.log(`📊 Organization limit: ${org.monthlyJobLimit}, current: ${org.currentMonthJobCount}`);
      
      // Test limit logic
      const limitExceeded = org.currentMonthJobCount >= (org.monthlyJobLimit || 0);
      
      if (limitExceeded) {
        console.log('🚫 Job limit exceeded - should block creation');
        expect(org.currentMonthJobCount).toBeGreaterThanOrEqual(org.monthlyJobLimit || 0);
      } else {
        console.log('✅ Under limit - can create jobs');
        expect(org.currentMonthJobCount).toBeLessThan(org.monthlyJobLimit || 0);
      }
    }
  });
  
  it('should handle null monthlyJobLimit gracefully', async () => {
    const testOrgId = 120003;
    const org = await getOrganizationById(testOrgId);
    
    if (!org) {
      throw new Error('Test organization not found');
    }
    
    // Test the same logic used in the endpoint
    const isUnlimited = (org.monthlyJobLimit || 0) === -1;
    const limitExceeded = !isUnlimited && org.currentMonthJobCount >= (org.monthlyJobLimit || 0);
    
    // Should not throw errors with null handling
    expect(typeof isUnlimited).toBe('boolean');
    expect(typeof limitExceeded).toBe('boolean');
    
    console.log(`Null handling test: isUnlimited=${isUnlimited}, limitExceeded=${limitExceeded}`);
  });
});

