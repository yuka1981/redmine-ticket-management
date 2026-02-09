import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { LanguageSwitcher } from './LanguageSwitcher';

export function AppHeader() {
  return (
    <header className="flex h-14 items-center gap-4 border-b px-4 shrink-0">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-6" />
      <div className="flex-1" />
      <LanguageSwitcher />
    </header>
  );
}
