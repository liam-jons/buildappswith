/**
 * @test-category performance-monitoring
 * @environment client
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as Sentry from '@sentry/nextjs';
import { 
  configureSentryPerformance,
  createTransaction,
  monitorPerformance,
  createSpan,
  measureComponentPerformance
} from '@/lib/sentry';

// Mock sentryConfig from ./config
vi.mock('@/lib/sentry/config', () => ({
  sentryConfig: {
    getSampleRate: vi.fn().mockReturnValue(0.5),
    shouldSampleTransaction: vi.fn((name) => {
      if (name === 'payment.process') return 1.0;
      return 0.5;
    }),
  },
}));

// Mock Sentry
vi.mock('@sentry/nextjs', () => {
  const mockTransaction = {
    setTag: vi.fn(),
    setData: vi.fn(),
    setStatus: vi.fn(),
    finish: vi.fn(),
    startChild: vi.fn().mockReturnValue({
      setTag: vi.fn(),
      setData: vi.fn(),
      setStatus: vi.fn(),
      finish: vi.fn(),
    }),
  };

  const mockScope = {
    setSpan: vi.fn(),
    getSpan: vi.fn().mockReturnValue(mockTransaction),
  };

  return {
    startTransaction: vi.fn().mockReturnValue(mockTransaction),
    configureScope: vi.fn((callback) => callback(mockScope)),
    getCurrentHub: vi.fn(() => ({
      getScope: vi.fn(() => mockScope),
    })),
    Replay: vi.fn(function(options) {
      this.options = options;
      return this;
    }),
  };
});

describe('Performance Monitoring', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('configureSentryPerformance', () => {
    it('should add performance monitoring configuration to Sentry config', () => {
      const baseConfig = {
        dsn: 'https://examplePublicKey@o0.ingest.sentry.io/0',
        environment: 'test',
      };
      
      const enhancedConfig = configureSentryPerformance(baseConfig);
      
      // Check base config is preserved
      expect(enhancedConfig).toHaveProperty('dsn', baseConfig.dsn);
      expect(enhancedConfig).toHaveProperty('environment', baseConfig.environment);
      
      // Check performance monitoring configs
      expect(enhancedConfig).toHaveProperty('tracesSampleRate');
      expect(enhancedConfig).toHaveProperty('tracePropagationTargets');
      expect(enhancedConfig).toHaveProperty('profilesSampleRate');
      expect(enhancedConfig).toHaveProperty('enableWebVitals');
      expect(enhancedConfig).toHaveProperty('integrations');
    });
    
    it('should add Replay integration with proper configuration', () => {
      const baseConfig = {
        dsn: 'https://examplePublicKey@o0.ingest.sentry.io/0',
      };
      
      const enhancedConfig = configureSentryPerformance(baseConfig);
      
      // Find the Replay integration
      const replayIntegration = enhancedConfig.integrations.find(
        integration => integration instanceof Sentry.Replay
      );
      
      expect(replayIntegration).toBeDefined();
      expect(replayIntegration.options).toHaveProperty('maskAllText', true);
      expect(replayIntegration.options).toHaveProperty('blockAllMedia', true);
    });
    
    it('should preserve existing integrations', () => {
      const existingIntegration = { name: 'ExistingIntegration' };
      const baseConfig = {
        dsn: 'https://examplePublicKey@o0.ingest.sentry.io/0',
        integrations: [existingIntegration],
      };
      
      const enhancedConfig = configureSentryPerformance(baseConfig);
      
      // Check that the existing integration is preserved
      expect(enhancedConfig.integrations).toContain(existingIntegration);
    });
  });

  describe('createTransaction', () => {
    it('should create a transaction with minimal options', () => {
      const transaction = createTransaction({
        name: 'test.transaction',
      });
      
      expect(Sentry.startTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'test.transaction',
          op: 'custom', // Default value
        })
      );
      
      expect(Sentry.configureScope).toHaveBeenCalled();
      expect(transaction).toBeDefined();
    });
    
    it('should create a transaction with full options', () => {
      const options = {
        name: 'checkout.payment',
        op: 'payment',
        description: 'Processing payment',
        tags: { paymentMethod: 'credit_card' },
        data: { amount: 100 },
        sampled: true,
      };
      
      const transaction = createTransaction(options);
      
      expect(Sentry.startTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          name: options.name,
          op: options.op,
          description: options.description,
          sampled: options.sampled,
        })
      );
      
      expect(transaction.setTag).toHaveBeenCalledWith('paymentMethod', 'credit_card');
      expect(transaction.setData).toHaveBeenCalledWith('amount', 100);
    });
    
    it('should use sentryConfig to determine sampling', () => {
      // Critical transaction that should always be sampled
      createTransaction({
        name: 'payment.process',
      });
      
      // Check that we used the sentryConfig to determine sampling
      expect(require('@/lib/sentry/config').sentryConfig.shouldSampleTransaction).toHaveBeenCalledWith('payment.process');
    });
  });

  describe('monitorPerformance', () => {
    it('should wrap an async operation in a transaction', async () => {
      const mockOperation = vi.fn().mockResolvedValue('result');
      
      const result = await monitorPerformance('api.fetchUsers', mockOperation, {
        op: 'http',
        description: 'Fetching user list',
      });
      
      expect(result).toBe('result');
      expect(mockOperation).toHaveBeenCalled();
      
      // Check transaction was created
      expect(Sentry.startTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'api.fetchUsers',
          op: 'http',
          description: 'Fetching user list',
        })
      );
      
      // Check transaction was finished
      const transaction = await Sentry.startTransaction.mock.results[0].value;
      expect(transaction.setStatus).toHaveBeenCalledWith('ok');
      expect(transaction.finish).toHaveBeenCalled();
    });
    
    it('should handle errors in the monitored operation', async () => {
      const error = new Error('API error');
      const mockOperation = vi.fn().mockRejectedValue(error);
      
      await expect(
        monitorPerformance('api.fetchUsers', mockOperation)
      ).rejects.toThrow(error);
      
      // Check transaction was created
      expect(Sentry.startTransaction).toHaveBeenCalled();
      
      // Check transaction was finished with error status
      const transaction = await Sentry.startTransaction.mock.results[0].value;
      expect(transaction.setStatus).toHaveBeenCalledWith('internal_error');
      expect(transaction.setTag).toHaveBeenCalledWith('error', 'true');
      expect(transaction.setData).toHaveBeenCalledWith('error.message', error.message);
      expect(transaction.setData).toHaveBeenCalledWith('error.name', error.name);
      expect(transaction.finish).toHaveBeenCalled();
    });
  });

  describe('createSpan', () => {
    it('should create a child span when a transaction exists', () => {
      // Mock having an active transaction in the scope
      const mockTransaction = Sentry.startTransaction.mock.results[0]?.value;
      
      if (!mockTransaction) {
        // Create a transaction first
        createTransaction({ name: 'parent.transaction' });
      }
      
      const span = createSpan('db.query', { op: 'db' });
      
      expect(Sentry.getCurrentHub).toHaveBeenCalled();
      expect(mockTransaction.startChild).toHaveBeenCalledWith(
        expect.objectContaining({
          op: 'db',
        })
      );
      
      expect(span).toBeDefined();
    });
    
    it('should create a new transaction when no transaction exists', () => {
      // Force no active transaction
      Sentry.getCurrentHub.mockImplementationOnce(() => ({
        getScope: vi.fn(() => ({
          getSpan: vi.fn(() => null),
        })),
      }));
      
      createSpan('db.query', { op: 'db' });
      
      // Should fall back to creating a transaction
      expect(Sentry.startTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'db.query',
          op: 'db',
        })
      );
    });
  });

  describe('measureComponentPerformance', () => {
    it('should monitor component operations with correct tags', async () => {
      const mockOperation = vi.fn().mockResolvedValue('result');
      
      await measureComponentPerformance(
        'UserProfile.fetchData',
        mockOperation,
        { userId: '123' }
      );
      
      expect(Sentry.startTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'UserProfile.fetchData',
          op: 'react',
        })
      );
      
      // Check component name was extracted as a tag
      const transaction = await Sentry.startTransaction.mock.results[0].value;
      expect(transaction.setTag).toHaveBeenCalledWith('component', 'UserProfile');
      expect(transaction.setTag).toHaveBeenCalledWith('userId', '123');
    });
  });
});