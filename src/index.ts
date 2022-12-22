import { Environment } from './utils/environment';
import { startApp } from './setup/app';
import { startJobs } from './setup/bullmq';

startJobs();
startApp().then((app) => {
  app.listen(Environment.port);
  console.log(`App started on port ${Environment.port}`);
});
