import { Queue, Worker } from 'bullmq';
import { shrtlnkBackup } from '../jobs/shrtlnk-backup';
import { Environment } from '../utils/environment';

// Queues

export const shrtlnkQueue = new Queue('shrtlnk', {
  connection: Environment.redisConnection,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  },
});

export const allQueues = [shrtlnkQueue];

// Workers

new Worker('shrtlnk', shrtlnkBackup, {
  concurrency: 50,
  connection: Environment.redisConnection,
});

export function startJobs() {
  const everySixHours = '0 */6 * * *';

  shrtlnkQueue.add('6-hour-backup', null, {
    repeat: {
      pattern: everySixHours,
      immediately: !Environment.isProduction,
    },
  });
}
