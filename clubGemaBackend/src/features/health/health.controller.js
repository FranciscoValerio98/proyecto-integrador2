import { apiResponse } from '../../shared/utils/response.util.js';
import { catchAsync } from '../../shared/utils/catchAsync.util.js';

export const healthController = {
  healthCheck: catchAsync(async (req, res) => {
    return apiResponse.success(res, {
      statusCode: 200,
      message: 'Gema Academy API is running',
      data: {
        timestamp: new Date().toISOString(),
      },
    });
  }),
};
