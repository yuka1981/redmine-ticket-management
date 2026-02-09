import ky from 'ky';
import { useAuthStore } from '@/stores/authStore';

export const api = ky.create({
  prefixUrl: '/api',
  hooks: {
    beforeRequest: [
      (request) => {
        const { redmineUrl, apiKey } = useAuthStore.getState();
        if (redmineUrl) {
          request.headers.set('X-Redmine-Url', redmineUrl);
        }
        if (apiKey) {
          request.headers.set('X-Redmine-Api-Key', apiKey);
        }
      },
    ],
    afterResponse: [
      async (_request, _options, response) => {
        if (response.status === 401) {
          useAuthStore.getState().logout();
          window.location.href = '/login';
        }
      },
    ],
  },
});
