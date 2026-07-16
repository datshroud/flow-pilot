import { createApp } from './app.js';

const port = Number.parseInt(process.env['GATEWAY_PORT'] ?? '4000', 10);

createApp().listen(port, () => {
  console.log('Gateway listening on port ', port);
});
