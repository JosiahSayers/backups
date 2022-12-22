import {
  ExpressAdapter,
  createBullBoard,
  BullMQAdapter,
} from '@bull-board/express';
import { allQueues } from './bullmq';

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/');

createBullBoard({
  queues: allQueues.map((queue) => new BullMQAdapter(queue)),
  serverAdapter,
});

export { serverAdapter };
