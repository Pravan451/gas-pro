import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmergencyAlert {
  id: string;
  message: string;
  level: 'warning' | 'danger' | 'critical';
  location?: string;
  timestamp: Date;
}

interface EmergencyAlertSystemProps {
  alerts: EmergencyAlert[];
  onDismiss: (id: string) => void;
}

const EmergencyAlertSystem: React.FC<EmergencyAlertSystemProps> = ({ alerts, onDismiss }) => {
  const [visibleAlerts, setVisibleAlerts] = useState<EmergencyAlert[]>([]);

  useEffect(() => {
    setVisibleAlerts(alerts);
  }, [alerts]);

  const getAlertStyles = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-gradient-danger text-destructive-foreground shadow-danger border-destructive emergency-pulse';
      case 'danger':
        return 'bg-destructive text-destructive-foreground shadow-danger border-destructive animate-pulse';
      case 'warning':
        return 'bg-warning text-warning-foreground shadow-lg border-warning';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getIcon = (level: string) => {
    return <AlertTriangle className="h-5 w-5 flex-shrink-0" />;
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 space-y-2 p-4">
      <AnimatePresence>
        {visibleAlerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className={`
              relative flex items-center gap-3 p-4 rounded-lg border-2 backdrop-blur-md
              slide-down ${getAlertStyles(alert.level)}
            `}
          >
            <div className="flex items-center gap-3 flex-1">
              {getIcon(alert.level)}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold">
                    🚨 {alert.level.toUpperCase()}
                  </span>
                  {alert.location && (
                    <span className="text-xs opacity-80">
                      Location: {alert.location}
                    </span>
                  )}
                </div>
                <p className="font-medium">{alert.message}</p>
                <p className="text-xs opacity-80">
                  {alert.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDismiss(alert.id)}
              className="h-8 w-8 p-0 hover:bg-black/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default EmergencyAlertSystem;