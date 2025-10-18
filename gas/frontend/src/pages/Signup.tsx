import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, User, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signup } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      return 'Full name is required';
    }
    if (!formData.email.includes('@')) {
      return 'Valid email address is required';
    }
    if (formData.password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const success = await signup(formData.name, formData.email, formData.password);
      if (success) {
        toast({
          title: "Account Created Successfully",
          description: "Welcome to GasGuard Pro V7! Your account has been created.",
        });
        navigate('/dashboard');
      } else {
        setError('An account with this email already exists. Please use a different email.');
      }
    } catch (err) {
      setError('An error occurred during signup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const securityFeatures = [
    'End-to-end encrypted communications',
    'Multi-factor authentication support', 
    'Role-based access control',
    'Audit logging and compliance'
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Security Features */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center lg:text-left"
        >
          <div className="flex items-center gap-3 justify-center lg:justify-start mb-8">
            <div className="p-3 bg-gradient-success rounded-lg shadow-success">
              <Shield className="h-8 w-8 text-success-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground">Join GasGuard Pro</h1>
              <p className="text-success font-semibold">Secure Industrial Monitoring</p>
            </div>
          </div>
          
          <div className="space-y-6 text-muted-foreground">
            <h2 className="text-2xl font-semibold text-foreground">
              Enterprise-Grade Safety Management
            </h2>
            <p className="text-lg">
              Create your account to access advanced gas monitoring and safety control systems
            </p>
            
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground">Security Features</h3>
              {securityFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                  <span>{feature}</span>
                </motion.div>
              ))}
            </div>

            <div className="industrial-card p-6 mt-8">
              <h3 className="font-semibold text-primary mb-3">What You Get</h3>
              <ul className="space-y-2 text-sm">
                <li>• Real-time monitoring of multiple gas sensors</li>
                <li>• Emergency alert system with instant notifications</li>
                <li>• Remote valve control and emergency shutdown</li>
                <li>• AI-powered safety assistant and recommendations</li>
                <li>• Comprehensive logging and audit trails</li>
                <li>• Mobile-responsive dashboard access</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Signup Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md mx-auto"
        >
          <Card className="industrial-card border-2">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center gap-2 mb-4">
                <User className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Create Account</h2>
              </div>
              <p className="text-muted-foreground">
                Set up your safety monitoring account
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
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter your full name"
                      className="pl-10 bg-input"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
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
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Create a password (min. 6 characters)"
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

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      placeholder="Confirm your password"
                      className="pl-10 pr-10 bg-input"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full safety-button bg-gradient-success hover:shadow-success"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Create Safety Account'}
                </Button>
              </form>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary hover:text-primary-glow font-medium">
                    Login here
                  </Link>
                </p>
              </div>

              <div className="text-xs text-muted-foreground text-center border-t pt-4">
                By creating an account, you agree to our industrial safety protocols
                and data protection standards.
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;