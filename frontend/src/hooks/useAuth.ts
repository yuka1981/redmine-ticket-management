import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import type { AuthCredentials, AuthVerifyResponse } from '@/types/redmine';

export function useAuth() {
  const setCredentials = useAuthStore((s) => s.setCredentials);
  const logout = useAuthStore((s) => s.logout);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  const verifyMutation = useMutation({
    mutationFn: (creds: AuthCredentials) =>
      api.post('auth/verify', { json: creds }).json<AuthVerifyResponse>(),
    onSuccess: (data, variables) => {
      setCredentials(variables, data.user);
    },
  });

  return {
    isAuthenticated,
    user,
    verify: verifyMutation.mutateAsync,
    isVerifying: verifyMutation.isPending,
    verifyError: verifyMutation.error,
    logout,
  };
}
