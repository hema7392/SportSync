import { apiRequest } from './client';

export const reportsApi = {
  getSessionsReport: (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/reports/sessions${queryString}`);
  },
};
