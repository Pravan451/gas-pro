import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const demoCredentials = [
    { email: 'admin@gasguard.com', password: 'admin123', role: 'Administrator' },
    { email: 'operator@gasguard.com', password: 'operator123', role: 'Operator' },
    { email: 'tech@gasguard.com', password: 'tech123', role: 'Technician' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        toast({
          title: "Login Successful",
          description: "Welcome to GasGuard Pro V7",
        });
        navigate('/dashboard');
      } else {
        setError('Invalid email or password. Please check the demo credentials below.');
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  const fillDemoCredentials = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
    setError('');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center lg:text-left"
        >
          <div className="flex items-center gap-3 justify-center lg:justify-start mb-8">
            <div className="p-3 bg-gradient-primary rounded-lg shadow-industrial industrial-glow">
              <Shield className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground">GasGuard Pro</h1>
              <p className="text-primary font-semibold">V7 Industrial Safety</p>
            </div>
          </div>
          
          <div className="space-y-4 text-muted-foreground">
            <h2 className="text-2xl font-semibold text-foreground">
              Multi-Room Gas Monitoring & Valve Control System
            </h2>
            <p className="text-lg">
              Advanced real-time monitoring with emergency response capabilities
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              <div className="industrial-card p-4">
                <h3 className="font-semibold text-primary mb-2">Real-Time Monitoring</h3>
                <p className="text-sm">Continuous sensor data streaming every 3 seconds</p>
              </div>
              <div className="industrial-card p-4">
                <h3 className="font-semibold text-primary mb-2">Emergency Alerts</h3>
                <p className="text-sm">Instant notifications for dangerous gas levels</p>
              </div>
              <div className="industrial-card p-4">
                <h3 className="font-semibold text-primary mb-2">Valve Control</h3>
                <p className="text-sm">Remote valve operation and emergency shutdown</p>
              </div>
              <div className="industrial-card p-4">
                <h3 className="font-semibold text-primary mb-2">AI Assistant</h3>
                <p className="text-sm">Intelligent safety recommendations and analysis</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md mx-auto"
        >
          <Card className="industrial-card border-2">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Lock className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Secure Login</h2>
              </div>
              <p className="text-muted-foreground">
                Access your safety monitoring dashboard
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {error && (
                <Alert className="border-destructive/50 bg-destructive/10">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-destructive">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="pl-10 bg-input"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="pl-10 pr-10 bg-input"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full safety-button bg-gradient-primary hover:shadow-industrial"
                  disabled={isLoading}
                >
                  {isLoading ? 'Authenticating...' : 'Login to Dashboard'}
                </Button>
              </form>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-primary hover:text-primary-glow font-medium">
                    Sign up here
                  </Link>
                </p>
              </div>

              {/* Demo Credentials */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-center mb-3"></h4>
                <div className="space-y-2">
                  {demoCredentials.map((cred, index) => (
                    <button
                      key={index}
                      onClick={() => fillDemoCredentials(cred.email, cred.password)}
                      className="w-full text-left p-2 rounded bg-muted/50 hover:bg-muted text-sm border border-border hover:border-primary/30 transition-colors"
                    >
                      <div className="font-medium">{cred.role}</div>
                      <div className="text-xs text-muted-foreground">{cred.email}</div>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;