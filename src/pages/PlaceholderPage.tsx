import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { AetherMindLogo } from '@/components/AetherMindLogo';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
interface PlaceholderPageProps {
  title: string;
  description: string;
}
export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  const navigate = useNavigate();
  const mockSidebarProps = {
    sessions: [],
    activeSessionId: '',
    onNewSession: () => toast.info('New session not available on this page.'),
    onSwitchSession: () => toast.info('Session switching not available on this page.'),
    onClearAllSessions: () => toast.info('Clearing sessions not available on this page.'),
    onStartRenameSession: () => toast.info('Renaming sessions not available on this page.'),
    onDeleteSession: () => toast.info('Deleting sessions not available on this page.'),
  };
  const mockOnOpenSettings = () => toast.info('Settings not available on this page.');
  return (
    <AppLayout sidebarProps={mockSidebarProps} onOpenSettings={mockOnOpenSettings} container={true}>
      <div className="flex flex-col items-center justify-center h-full text-center py-16 md:py-24 lg:py-32 relative">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-5" 
          style={{backgroundImage: "url('https://images.unsplash.com/photo-1507679799977-c9331956b560?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')"}}
        />
        <div className="relative z-10">
          <AetherMindLogo className="mb-8 justify-center" iconClassName="w-16 h-16" textClassName="text-4xl" />
          <h1 className="text-4xl font-bold text-foreground mb-4">{title}</h1>
          <p className="text-lg text-muted-foreground max-w-xl mb-8">{description}</p>
          <Button className="btn-aether-primary" onClick={() => navigate('/')} aria-label="Go back to homepage">
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}