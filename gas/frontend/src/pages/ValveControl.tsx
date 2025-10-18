import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sliders, Power, Lock, AlertTriangle, CheckCircle, Clock, Activity, Shield } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSensors } from '@/contexts/SensorContext';
import { useToast } from '@/hooks/use-toast';

const ValveControl: React.FC = () => {
  const { valves, sensors, toggleValve, emergencyShutdown } = useSensors();
  const { toast } = useToast();
  const [showEmergencyConfirm, setShowEmergencyConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Use first valve for control
  const valve = valves[0];
  const sensorData = sensors.find(sensor => sensor.roomId === valve?.roomId);
  const isCritical = sensorData?.status === 'danger';

  // API call to backend
  const updateValveState = async (valveId: string, newState: boolean) => {
    if (!valveId) return;
    try {
      setLoading(true);
      const token = localStorage.getItem('gasguard-token');
      const res = await fetch(`http://localhost:5000/valves/${valveId}/control`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: newState ? 'ON' : 'OFF' }),
      });
      if (!res.ok) throw new Error('Failed to update valve state');

      const data = await res.json();
      toggleValve(valveId, data.status === 'ON'); // update frontend after backend success
      toast({
        title: 'Valve Operation',
        description: `${valve?.name} is now ${data.status}`,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error',
        description: 'Could not update valve state',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleValveToggle = () => {
    if (!valve) return;
    updateValveState(valve.valveId, !valve.isOpen);
  };

  const handleEmergencyShutdown = async () => {
    if (!valve) return;
    try {
      setLoading(true);
      const token = localStorage.getItem('gasguard-token');
      await fetch(`http://localhost:5000/valves/${valve.valveId}/control`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'OFF' }),
      });
      emergencyShutdown();
      toast({
        title: 'Emergency Shutdown Activated',
        description: 'All valves have been closed immediately.',
        variant: 'destructive',
      });
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error',
        description: 'Failed to execute emergency shutdown',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setShowEmergencyConfirm(false);
    }
  };

  const getValveStatusColor = () => {
    if (!valve) return 'text-muted-foreground';
    if (valve.isOpen) return 'text-success';
    return 'text-muted-foreground';
  };

  const getValveStatusBadge = () => {
    if (!valve) return { variant: 'outline' as const, text: 'UNKNOWN' };
    if (valve.isOpen) return { variant: 'default' as const, text: 'OPEN' };
    return { variant: 'outline' as const, text: 'CLOSED' };
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Sliders className="h-8 w-8 text-primary" />
            Gas Valve Control
          </h1>
          <p className="text-muted-foreground">Remote control of the gas valve</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowEmergencyConfirm(true)}
            disabled={loading}
            className="bg-gradient-danger hover:shadow-danger text-destructive-foreground"
          >
            <AlertTriangle className="h-5 w-5 mr-2" />
            Emergency Shutdown
          </Button>
        </div>
      </div>

      {/* Emergency Confirmation */}
      {showEmergencyConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="industrial-card border-destructive/50 max-w-md w-full p-6"
          >
            <div className="text-center space-y-4">
              <div className="p-3 bg-destructive/10 rounded-full inline-block">
                <AlertTriangle className="h-8 w-8 text-destructive emergency-pulse" />
              </div>
              <h3 className="text-xl font-bold text-destructive">Emergency Shutdown</h3>
              <p className="text-muted-foreground">
                This will immediately close the gas valve. This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => setShowEmergencyConfirm(false)}>Cancel</Button>
                <Button
                  onClick={handleEmergencyShutdown}
                  disabled={loading}
                  className="bg-gradient-danger hover:shadow-danger text-destructive-foreground"
                >
                  Confirm Shutdown
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Critical Alert */}
      {isCritical && (
        <Alert className="border-destructive/50 bg-destructive/10">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-destructive">
            <strong>Critical Gas Level Detected!</strong> {sensorData?.roomName} has dangerous gas levels.
          </AlertDescription>
        </Alert>
      )}

      {/* Valve Control Card */}
      {valve && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className={`industrial-card ${isCritical ? 'border-destructive/50 bg-destructive/5' : ''}`}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${valve.isOpen ? 'bg-success/10' : 'bg-muted/10'}`}>
                    <Power className={`h-5 w-5 ${getValveStatusColor()}`} />
                  </div>
                  {valve.name}
                </CardTitle>
                <Badge {...getValveStatusBadge()}>{getValveStatusBadge().text}</Badge>
              </div>

              {sensorData && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Activity className="h-4 w-4" />
                  <span>Room: {sensorData.roomName}</span>
                  <span className={`font-semibold ml-2 ${sensorData.status === 'danger' ? 'text-destructive' : sensorData.status === 'warning' ? 'text-warning' : 'text-success'}`}>
                    {sensorData.gasType}: {sensorData.level} {sensorData.unit}
                  </span>
                </div>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Valve Switch */}
              <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${valve.isOpen ? 'bg-success shadow-success status-pulse' : 'bg-muted'}`} />
                  <span className="font-medium">Valve Status: {valve.isOpen ? 'Open' : 'Closed'}</span>
                </div>

                <Switch
                  checked={valve.isOpen}
                  disabled={loading}
                  onCheckedChange={handleValveToggle}
                  className="data-[state=checked]:bg-primary"
                />
              </div>

              {/* Control Button */}
              <Button
                onClick={handleValveToggle}
                disabled={loading}
                variant={valve.isOpen ? 'destructive' : 'default'}
                className="flex-1"
              >
                {valve.isOpen ? (
                  <>
                    <Power className="h-4 w-4 mr-2" />
                    Close Valve
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Open Valve
                  </>
                )}
              </Button>

              {/* Operation Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <span className="text-muted-foreground">Last Operation:</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span className="font-mono">{valve.lastOperation ? new Date(valve.lastOperation).toLocaleTimeString() : 'N/A'}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-muted-foreground">Room Status:</span>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${sensorData?.status === 'online' ? 'bg-success' : sensorData?.status === 'warning' ? 'bg-warning' : sensorData?.status === 'danger' ? 'bg-destructive' : 'bg-muted'}`} />
                    <span className="capitalize">{sensorData?.status || 'Unknown'}</span>
                  </div>
                </div>
              </div>

              {/* Safety Notice */}
              {isCritical && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-destructive text-sm">
                    <Shield className="h-4 w-4" />
                    <span className="font-medium">Critical Safety Alert</span>
                  </div>
                  <p className="text-xs text-destructive/80 mt-1">
                    Dangerous gas levels detected in this room. Consider closing valve immediately.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default ValveControl;
