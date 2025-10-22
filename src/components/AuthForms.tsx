import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const MOCK_USERNAME = 'testuser';
const MOCK_PASSWORD = 'password123';
export const LoginForm: React.FC = () => {
  const [username, setUsername] = useState(MOCK_USERNAME);
  const [password, setPassword] = useState(MOCK_PASSWORD);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const result = await login(username, password);
    if (result.success) {
      toast.success('Login successful!');
      navigate('/');
    } else {
      const errorMessage = result.error || 'Login failed.';
      toast.error(errorMessage);
      setError(errorMessage);
    }
    setIsLoading(false);
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login-username">Username</Label>
        <Input id="login-username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required aria-invalid={!!error} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="login-password">Password</Label>
        <Input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required aria-invalid={!!error} />
      </div>
      <Button type="submit" className="w-full btn-aether-primary" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Log In
      </Button>
    </form>
  );
};
export const SignupForm: React.FC<{ onSignupSuccess: () => void }> = ({ onSignupSuccess }) => {
  const [username, setUsername] = useState(MOCK_USERNAME);
  const [password, setPassword] = useState(MOCK_PASSWORD);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const result = await signup(username, password);
    if (result.success) {
      toast.success('Signup successful! Please log in.');
      onSignupSuccess();
    } else {
      const errorMessage = result.error || 'Signup failed.';
      toast.error(errorMessage);
      setError(errorMessage);
    }
    setIsLoading(false);
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signup-username">Username</Label>
        <Input id="signup-username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required aria-invalid={!!error} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <Input id="signup-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required aria-invalid={!!error} />
      </div>
      <Button type="submit" className="w-full btn-aether-primary" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Sign Up
      </Button>
    </form>
  );
};