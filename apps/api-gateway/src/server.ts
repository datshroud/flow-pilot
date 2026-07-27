import { createApp } from './app.js';

const port = Number.parseInt(process.env['API_GATEWAY_PORT'] ?? '4000', 10);

createApp().listen(port, () => {
  console.log('Gateway listening on port ', port);
});
