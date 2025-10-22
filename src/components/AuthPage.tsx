import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AetherMindLogo } from '@/components/AetherMindLogo';
import { LoginForm, SignupForm } from '@/components/AuthForms';
import { useAuth } from '@/hooks/use-auth';
import { Toaster } from '@/components/ui/sonner';
import { ThemeToggle } from '@/components/ThemeToggle';
export const AuthPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 animate-fade-in">
      <ThemeToggle className="absolute top-4 right-4" />
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <AetherMindLogo />
        </div>
        <Card className="card-aether-glass shadow-soft-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-foreground">
              Welcome to AetherMind
            </CardTitle>
            <CardDescription>
              Log in or create an account to begin your research.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Log In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              <TabsContent value="login" className="mt-6">
                <LoginForm />
              </TabsContent>
              <TabsContent value="signup" className="mt-6">
                <SignupForm onSignupSuccess={() => setActiveTab('login')} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        <p className="text-center text-xs text-muted-foreground mt-6">
          Built with ❤️ at Cloudflare
        </p>
      </div>
      <Toaster richColors />
    </div>
  );
};