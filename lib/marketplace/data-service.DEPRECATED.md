# DEPRECATED DATA SERVICE

This data service has been consolidated into the new domain-based architecture.
Please use `marketplace-service.ts` instead.

## Migration

1. Update imports to use the consolidated service:
   ```typescript
   // OLD
   import { getBuilders, getBuilder } from '@/lib/marketplace/data-service';

   // NEW
   import { getBuilders, getBuilder } from '@/lib/marketplace/marketplace-service';
   ```

2. The interface remains compatible, but all future updates will happen in marketplace-service.ts

This file is kept for historical reference but will be removed in a future cleanup.
