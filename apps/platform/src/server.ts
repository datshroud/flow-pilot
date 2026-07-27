import { createApp } from './app.js';

const port = Number.parseInt(process.env['PLATFORM_PORT'] ?? '4102', 10);

createApp().listen(port, () => {
  console.log('Intelligence API listening on port', port);
});
