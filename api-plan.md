# API Plan: Implementing Webhooks System

## Context
We need to implement a webhook system that allows external services to send data to our application. Each webhook should have a unique URL that can receive POST requests and process them accordingly.

## Technical Requirements

### Database Schema (Supabase)
```sql
-- Create webhooks table
create table if not exists public.webhooks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  webhook_url text not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_request jsonb
);

-- Enable RLS
alter table webhooks enable row level security;

-- Create policies
create policy "Users can view their own webhooks"
  on webhooks for select
  using (auth.uid() = user_id);

create policy "Users can create their own webhooks"
  on webhooks for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own webhooks"
  on webhooks for update
  using (auth.uid() = user_id);

create policy "Users can delete their own webhooks"
  on webhooks for delete
  using (auth.uid() = user_id);

-- Allow public access to webhooks by ID
create policy "Public can view webhooks by ID"
  on webhooks for select
  using (true);
```

### Type Definitions
```typescript
interface WebhookPayload {
  message?: string;
  timestamp?: string;
  data?: Record<string, any>;
}

interface WebhookResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

interface WebhookError {
  error: string;
  details?: string;
  code?: string;
}
```

### Implementation Components

1. Webhook Controller (`src/api/webhooks/controller.ts`):
```typescript
export async function createWebhook() {
  const webhookId = generateWebhookId();
  const baseUrl = process.env.VITE_WEBHOOK_LOCAL_URL || 'http://localhost:3000';
  const webhookUrl = `${baseUrl}/api/webhook/${webhookId}`;

  const { data, error } = await supabase
    .from('webhooks')
    .insert({
      webhook_url: webhookUrl,
      is_active: true
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function handleWebhookCall(webhookId: string, payload: any) {
  // Find webhook by URL or ID
  const { data: webhook, error: webhookError } = await supabase
    .from('webhooks')
    .select('*')
    .or(`webhook_url.eq.http://localhost:3000/api/webhook/${webhookId},id.eq.${webhookId}`)
    .single();

  if (webhookError || !webhook) {
    throw new Error('Webhook not found');
  }

  if (!webhook.is_active) {
    throw new Error('Webhook is not active');
  }

  // Update last_request
  await supabase
    .from('webhooks')
    .update({
      last_request: {
        timestamp: new Date().toISOString(),
        payload
      }
    })
    .eq('id', webhook.id);

  return {
    success: true,
    message: 'Webhook processed successfully',
    timestamp: new Date().toISOString()
  };
}
```

2. Webhook Routes (`src/api/webhooks/routes.ts`):
```typescript
const router = Router();

// Rate limiting middleware
const webhookLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

router.use(webhookLimiter);

// Route handlers
router.post('/webhooks/create', handleCreateWebhookRoute);
router.get('/webhooks/list', handleListWebhooksRoute);
router.delete('/webhooks/:webhookId', handleDeleteWebhookRoute);
router.put('/webhooks/:webhookId/toggle', handleToggleWebhookRoute);
router.post('/webhook/:webhookId', handleWebhookRequestRoute);

export default router;
```

3. Frontend Component (`src/components/webhooks/WebhookManager.tsx`):
```typescript
export const WebhookManager: React.FC = () => {
  const [webhookUrl, setWebhookUrl] = useState<string | null>(null);
  const [lastRequest, setLastRequest] = useState<WebhookRequest | null>(null);
  const [isListening, setIsListening] = useState(false);

  const generateWebhook = async () => {
    const { data, error } = await supabase
      .from('webhooks')
      .insert({
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;
    setWebhookUrl(data.webhook_url);
  };

  // ... rest of the component implementation
};
```

## Environment Configuration
```env
VITE_WEBHOOK_SECRET=your_webhook_secret
VITE_WEBHOOK_BASE_URL=your_base_url
VITE_WEBHOOK_LOCAL_URL=http://localhost:3000
VITE_WEBHOOK_RATE_LIMIT_WINDOW=900000
VITE_WEBHOOK_RATE_LIMIT_MAX=100
```

## Testing Strategy

1. Local Testing:
   - Use Postman to send test requests
   - Monitor webhook logs in terminal
   - Verify payload processing
   - Check database updates

2. Error Handling:
   - Test rate limiting
   - Verify inactive webhook handling
   - Test invalid webhook IDs
   - Monitor error logging

## Security Considerations

1. Rate Limiting:
   ```typescript
   const webhookLimiter = rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 100
   });
   ```

2. Error Handling:
   - Proper error messages
   - Status code mapping
   - Request validation
   - Payload size limits

3. Database Security:
   - Row Level Security (RLS)
   - Public access policies
   - User authentication

## Deployment Considerations

1. Environment Setup:
   - Configure webhook URLs
   - Set rate limits
   - Enable CORS
   - Configure proxies

2. Monitoring:
   - Request logging
   - Error tracking
   - Performance monitoring
   - Usage analytics

3. Documentation:
   - API endpoints
   - Payload formats
   - Error codes
   - Usage examples