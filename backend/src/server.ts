import { createApp } from './app';
import { env } from './config/env';
import './analytics/queue.monitor';

const app = createApp();
const port = Number(env.PORT);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
