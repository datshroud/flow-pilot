import { createApp } from './app.js';

const port = Number.parseInt(process.env['WORKSPACE_PORT'] ?? '4101', 10);

createApp().listen(port, () => {
  console.log('Workspace service listening on port', port);
});
