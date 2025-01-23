import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { LRUCache } from 'lru-cache';

// Pool configuration
const POOL_SIZE = 10;
const POOL_TIMEOUT = 30000; // 30 seconds

// Cache configuration
const PREFERENCES_CACHE = new LRUCache({
  max: 500,
  ttl: 1000 * 60 * 5, // 5 minutes
});

const WEBHOOKS_CACHE = new LRUCache({
  max: 500,
  ttl: 1000 * 60 * 5, // 5 minutes
});

class DatabasePool {
  private pool: SupabaseClient[] = [];
  private inUse: Set<SupabaseClient> = new Set();
  private waitingQueue: ((client: SupabaseClient) => void)[] = [];

  constructor(url: string, key: string) {
    // Initialize pool
    for (let i = 0; i < POOL_SIZE; i++) {
      this.pool.push(createClient(url, key, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }));
    }
  }

  async acquire(): Promise<SupabaseClient> {
    const availableClient = this.pool.find(client => !this.inUse.has(client));
    
    if (availableClient) {
      this.inUse.add(availableClient);
      return availableClient;
    }

    // If no client is available, wait for one
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        const index = this.waitingQueue.findIndex(cb => cb === resolver);
        if (index !== -1) {
          this.waitingQueue.splice(index, 1);
        }
        reject(new Error('Database pool timeout'));
      }, POOL_TIMEOUT);

      const resolver = (client: SupabaseClient) => {
        clearTimeout(timeout);
        resolve(client);
      };

      this.waitingQueue.push(resolver);
    });
  }

  release(client: SupabaseClient) {
    this.inUse.delete(client);
    
    if (this.waitingQueue.length > 0) {
      const nextInQueue = this.waitingQueue.shift();
      if (nextInQueue) {
        this.inUse.add(client);
        nextInQueue(client);
      }
    }
  }

  // Get webhook by ID
  async getWebhook(webhookId: string) {
    const cached = WEBHOOKS_CACHE.get(webhookId);
    if (cached) return cached;

    const client = await this.acquire();
    try {
      const { data, error } = await client
        .from('webhooks')
        .select('*')
        .or(`webhook_url.eq.http://localhost:3000/api/webhook/${webhookId},id.eq.${webhookId}`)
        .single();

      if (error) throw error;
      
      if (data) {
        WEBHOOKS_CACHE.set(webhookId, data);
      }
      
      return data;
    } finally {
      this.release(client);
    }
  }

  // Get preferences by assistant ID
  async getPreferences(assistantId: string) {
    const cached = PREFERENCES_CACHE.get(assistantId);
    if (cached) return cached;

    const client = await this.acquire();
    try {
      const { data, error } = await client
        .from('ghl_preferences')
        .select('*')
        .eq('assistant_id', assistantId)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        PREFERENCES_CACHE.set(assistantId, data);
      }
      
      return data;
    } finally {
      this.release(client);
    }
  }

  // Update webhook
  async updateWebhook(webhookId: string, updateData: any) {
    const client = await this.acquire();
    try {
      const { error } = await client
        .from('webhooks')
        .update(updateData)
        .eq('id', webhookId);

      if (error) throw error;
      
      // Invalidate cache
      WEBHOOKS_CACHE.delete(webhookId);
      
      return true;
    } finally {
      this.release(client);
    }
  }
}

// Create singleton instance
let poolInstance: DatabasePool | null = null;

export function initializePool(url: string, key: string) {
  if (!poolInstance) {
    poolInstance = new DatabasePool(url, key);
  }
  return poolInstance;
}

export function getPool() {
  if (!poolInstance) {
    throw new Error('Database pool not initialized');
  }
  return poolInstance;
} 