import { Queue, Worker, Job } from "bullmq";
import IORedis from "ioredis";

import { calculateLeadScore } from "./lead-scoring.service";

const REDIS_URL = process.env.REDIS_URL;

let _leadScoreQueue: Queue | null = null;
let _worker: Worker<any> | null = null;
let _connection: IORedis | null = null;

if (REDIS_URL) {
  _connection = new IORedis(REDIS_URL, {
    maxRetriesPerRequest: null,
    retryStrategy: (times) => Math.min(times * 50, 2000),
  });

  _leadScoreQueue = new Queue("lead-score", { connection: _connection });

  _leadScoreQueue.on("error", (err) => {
    console.error("Lead Score Queue Error:", err);
  });

  _worker = new Worker<JobData>(
    "lead-score",
    async (job: Job<JobData>) => {
      const { tenantId, customerId, leadId, triggerEvent } = job.data;
      console.log(`[LeadScore] Processing job for customer ${customerId}, trigger: ${triggerEvent}`);

      try {
        await calculateLeadScore({ tenantId, customerId, leadId, triggerEvent });
        console.log(`[LeadScore] Completed for customer ${customerId}`);
      } catch (error) {
        console.error(`[LeadScore] Failed for customer ${customerId}:`, error);
        throw error;
      }
    },
    { connection: _connection, concurrency: 5 }
  );

  _worker.on("completed", (job) => {
    console.log(`[LeadScore] Job ${job.id} completed for customer ${job.data.customerId}`);
  });

  _worker.on("failed", (job, err) => {
    console.error(`[LeadScore] Job ${job?.id} failed for customer ${job?.data?.customerId}:`, err);
  });
}

export interface JobData {
  tenantId: string;
  customerId: string;
  leadId?: string | null;
  triggerEvent: string;
}

export function getLeadScoreQueue(): Queue | null {
  return _leadScoreQueue;
}

export async function queueLeadScoreCalculation(data: JobData) {
  const queue = getLeadScoreQueue();
  if (!queue) {
    console.warn("[LeadScore] Queue not available (Redis not configured), skipping queue");
    return;
  }
  await queue.add("calculate", data, {
    attempts: 3,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  });
}

export async function closeLeadScoreQueue() {
  if (_worker) await _worker.close();
  if (_leadScoreQueue) await _leadScoreQueue.close();
  if (_connection) await _connection.quit();
}