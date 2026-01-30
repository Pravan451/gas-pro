import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sliders, Power, AlertTriangle, CheckCircle, Clock, Activity, Shield } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSensors } from '@/contexts/SensorContext';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

const ValveControl: React.FC = () => {
  const { valves, sensors, setValves, emergencyShutdown } = useSensors();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showEmergencyConfirm, setShowEmergencyConfirm] = useState(false);

  const valve = valves[0];
  const sensorData = sensors.find(s => s.roomId === valve?.location);
  const isCritical = sensorData?.status === 'danger';

  const updateValveState = async (valveId: string, newState: boolean) => {
    try {
      setLoading(true);

      const res = await api.post(`/valves/${valveId}/control`, {
        action: newState ? 'ON' : 'OFF',
      });

      const updatedValve = res.data;

      setValves(prev =>
        prev.map(v =>
          v.valveId === updatedValve.valveId ? updatedValve : v
        )
      );

      toast({
        title: 'Valve Updated',
        description: `Valve is now ${updatedValve.status}`,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error',
        description: 'Valve control failed',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleValveToggle = () => {
    if (!valve) return;
    updateValveState(valve.valveId, valve.status !== 'ON');
  };

  const handleEmergencyShutdown = async () => {
    try {
      setLoading(true);

      await Promise.all(
        valves.map(v =>
          api.post(`/valves/${v.valveId}/control`, { action: 'OFF' })
        )
      );

      emergencyShutdown();

      toast({
        title: 'Emergency Shutdown',
        description: 'All valves closed',
        variant: 'destructive',
      });
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error',
        description: 'Emergency shutdown failed',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setShowEmergencyConfirm(false);
    }
  };

  if (!valve) return null;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Sliders /> Gas Valve Control
      </h1>

      {isCritical && (
        <Alert className="border-destructive bg-destructive/10">
          <AlertTriangle />
          <AlertDescription>
            Dangerous gas detected in {sensorData?.roomName}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            {valve.location}
            <Badge>{valve.status}</Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span>Status</span>
            <Switch
              checked={valve.status === 'ON'}
              disabled={loading}
              onCheckedChange={handleValveToggle}
            />
          </div>

          <Button
            onClick={handleValveToggle}
            disabled={loading}
            variant={valve.status === 'ON' ? 'destructive' : 'default'}
          >
            {valve.status === 'ON' ? 'Close Valve' : 'Open Valve'}
          </Button>

          <Button
            variant="destructive"
            onClick={() => setShowEmergencyConfirm(true)}
          >
            Emergency Shutdown
          </Button>

          {showEmergencyConfirm && (
            <Button
              variant="destructive"
              onClick={handleEmergencyShutdown}
            >
              Confirm Shutdown
            </Button>
          )}

          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Clock />
            Last Updated: {new Date(valve.lastUpdated).toLocaleTimeString()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ValveControl;
