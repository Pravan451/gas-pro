import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  Settings, 
  User, 
  FileText, 
  Phone, 
  LogOut, 
  Shield, 
  Activity,
  Sliders,
  Brain,
  Menu,
  X
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';

const Navigation: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/dashboard', icon: BarChart3, label: 'Dashboard', color: 'text-primary' },
    { path: '/valve-control', icon: Sliders, label: 'Valve Control', color: 'text-success' },
    { path: '/logs', icon: FileText, label: 'System Logs', color: 'text-muted-foreground' },
    { path: '/settings', icon: Settings, label: 'Settings', color: 'text-muted-foreground' },
    { path: '/profile', icon: User, label: 'Profile', color: 'text-muted-foreground' },
    { path: '/contact', icon: Phone, label: 'Contact', color: 'text-muted-foreground' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const isActivePath = (path: string) => location.pathname === path;

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex fixed top-0 left-0 right-0 z-40 bg-card/90 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between w-full px-6 py-3">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="p-2 bg-gradient-primary rounded-lg shadow-industrial">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-foreground">GasGuard Pro</h1>
              <p className="text-xs text-primary font-medium">V7 Industrial</p>
            </div>
          </Link>

          {/* Menu Items */}
          <div className="flex items-center gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    relative flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-primary/10 text-primary shadow-industrial' 
                      : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                    }
                  `}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : item.color}`} />
                  <span className="font-medium text-sm">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                      initial={false}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* AI Assistant Button */}
          <Link 
            to="/ai-assistant"
            className={`
              p-2 rounded-lg transition-all duration-200 industrial-glow
              ${isActivePath('/ai-assistant') 
                ? 'bg-primary text-primary-foreground shadow-industrial' 
                : 'bg-accent/20 text-accent hover:bg-accent/30'
              }
            `}
            title="AI Safety Assistant"
          >
            <Brain className="h-5 w-5" />
          </Link>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.role}</p>
            </div>
            <Avatar className="h-9 w-9 border-2 border-primary/20">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {user?.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-card/90 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Mobile Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-primary rounded-md">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">GasGuard Pro</span>
          </Link>

          {/* AI Assistant & Menu Button */}
          <div className="flex items-center gap-2">
            <Link 
              to="/ai-assistant"
              className="p-2 rounded-lg bg-accent/20 text-accent hover:bg-accent/30 transition-colors"
            >
              <Brain className="h-5 w-5" />
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-30 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="fixed right-0 top-0 h-full w-80 bg-card border-l border-border shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 pt-20">
                {/* User Info */}
                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-border">
                  <Avatar className="h-12 w-12 border-2 border-primary/20">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                      {user?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground">{user?.name}</p>
                    <p className="text-sm text-muted-foreground">{user?.role}</p>
                    <p className="text-xs text-muted-foreground">{user?.department}</p>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="space-y-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = isActivePath(item.path);
                    
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`
                          flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                          ${isActive 
                            ? 'bg-primary/10 text-primary shadow-industrial' 
                            : 'hover:bg-muted/50 text-muted-foreground'
                          }
                        `}
                      >
                        <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : item.color}`} />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>

                {/* Logout Button */}
                <div className="mt-8 pt-6 border-t border-border">
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for fixed navigation */}
      <div className="h-16" />
    </>
  );
};

export default Navigation;