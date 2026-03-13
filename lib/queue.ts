import { Queue } from 'bullmq';
import Redis from 'ioredis';

const redisConnection = new Redis(process.env.UPSTASH_REDIS_REST_URL!, {
  maxRetriesPerRequest: null,
});

/**
 * Centralized BullMQ queue definitions.
 */
export const automationQueue = new Queue('automation', { 
  connection: redisConnection as any 
});
export const agentQueue = new Queue('agents', { 
  connection: redisConnection as any 
});
export const reportQueue = new Queue('reports', { 
  connection: redisConnection as any 
});

export async function addJob(queue: Queue, name: string, data: any, delay?: number) {
  await queue.add(name, data, {
    delay,
    removeOnComplete: true,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  });
}
