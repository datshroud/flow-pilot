import { createApp } from './app.js';

const port = Number.parseInt(process.env['TICKETS_PORT'] ?? '4102', 10);

createApp().listen(port, () => {
  console.log('Tickets API listening on port', port);
});
