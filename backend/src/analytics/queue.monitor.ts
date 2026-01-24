import { analyticsQueue } from './analytics.queue';
import { analyticsQueueDepth } from './analytics.queue';

setInterval(async () => {
  const count = await analyticsQueue.getWaitingCount();
  analyticsQueueDepth.set(count);
}, 5000);
