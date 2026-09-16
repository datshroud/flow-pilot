import { createApp } from './app.js';

const port = Number.parseInt(process.env['WORKER_PORT'] ?? '4103', 10);

createApp().listen(port, () => {
  console.log('Worker health endpoint listening on port', port);
});
