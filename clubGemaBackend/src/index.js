import app from './app.js';
import { PORT, NODE_ENV } from './config/secret.config.js';
import { logger } from './shared/utils/logger.util.js';

import { iniciarCronJobs } from './features/cron/services/cron-jobs.service.js';

app.listen(PORT, () => {
  logger.info(`🚀 Server running in ${NODE_ENV} mode`);
  logger.info(`🔗 Health check: http://localhost:${PORT}/health`);

  iniciarCronJobs();
});
