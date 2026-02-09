import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { useAuthStore } from '@/stores/authStore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState } from 'react';

export default function SettingsPage() {
  const { t } = useTranslation('settings');
  const { t: tCommon } = useTranslation();
  const navigate = useNavigate();
  const { user, redmineUrl, logout, isAuthenticated } = useAuthStore();
  const [logoutOpen, setLogoutOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold">{t('title')}</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('connection.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{t('connection.status')}</span>
            <Badge variant={isAuthenticated ? 'default' : 'destructive'}>
              {isAuthenticated ? t('connection.connected') : t('connection.disconnected')}
            </Badge>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{t('connection.redmine_url')}</span>
            <span className="text-sm font-mono">{redmineUrl || '-'}</span>
          </div>
          {user && (
            <>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{t('connection.connected_as')}</span>
                <span className="text-sm">{user.firstname} {user.lastname} ({user.login})</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('language.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{t('language.select')}</span>
            <LanguageSwitcher />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('account.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => setLogoutOpen(true)}>
            {t('account.logout')}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('account.logout_confirm')}</DialogTitle>
            <DialogDescription>
              {tCommon('logout_warning')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogoutOpen(false)}>
              {tCommon('cancel')}
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              {t('account.logout')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
