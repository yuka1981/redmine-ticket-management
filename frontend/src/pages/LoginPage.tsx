import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { AuthVerifyResponse } from '@/types/redmine';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';

const loginSchema = z.object({
  redmineUrl: z.string().url('Please enter a valid URL').min(1),
  apiKey: z.string().min(1, 'API key is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setCredentials = useAuthStore((s) => s.setCredentials);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setError('');
    try {
      const res = await api
        .post('auth/verify', {
          headers: {
            'X-Redmine-Url': data.redmineUrl,
            'X-Redmine-Api-Key': data.apiKey,
          },
        })
        .json<AuthVerifyResponse>();
      setCredentials(data, res.user);
      navigate('/dashboard');
    } catch {
      setError(t('login_failed'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t('app_name')}</CardTitle>
          <CardDescription>
            {t('login_description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="redmineUrl">{t('redmine_url')}</Label>
              <Input
                id="redmineUrl"
                placeholder={t('redmine_url_placeholder')}
                {...register('redmineUrl')}
              />
              {errors.redmineUrl && (
                <p className="text-sm text-destructive">{errors.redmineUrl.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiKey">{t('api_key')}</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder={t('api_key_placeholder')}
                {...register('apiKey')}
              />
              {errors.apiKey && (
                <p className="text-sm text-destructive">{errors.apiKey.message}</p>
              )}
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? t('loading') : t('login')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
