import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useSensors } from '@/contexts/SensorContext';
import { Button } from '@/components/ui/button';

export const SensorCard: React.FC = () => {
  const { sensors, valves, toggleValve, emergencyShutdown } = useSensors();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'danger': return 'destructive';
      case 'warning': return 'secondary';
      case 'offline': return 'muted';
      default: return 'outline';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sensors.map(sensor => (
        <div key={sensor.id} className="p-4 rounded-lg border border-border shadow-industrial bg-background">
          <h3 className="font-bold text-lg">{sensor.roomName || 'Unknown Room'}</h3>
          <p className="text-sm text-muted-foreground">{sensor.gasType || 'Unknown Gas'}</p>
          <div className="flex items-center gap-2 mt-2">
            <span>Level: {sensor.level} {sensor.unit}</span>
            <Badge variant={getStatusColor(sensor.status)}>{sensor.status.toUpperCase()}</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Last updated: {sensor.timestamp.toLocaleTimeString()}
          </p>

          {/* Valve controls for this room */}
          {valves.filter(v => v.roomId === sensor.roomId).map(valve => (
            <div key={valve.id} className="mt-2 flex items-center justify-between">
              <span className="text-sm">{valve.name}</span>
              <Button
                size="sm"
                disabled={valve.isLocked}
                onClick={() => toggleValve(valve.id)}
                className={valve.isOpen ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}
              >
                {valve.isOpen ? 'OPEN' : 'CLOSED'}
              </Button>
            </div>
          ))}
        </div>
      ))}
      <div className="col-span-full mt-4">
        <Button onClick={emergencyShutdown} className="w-full bg-red-600 hover:bg-red-700">
          Emergency Shutdown
        </Button>
      </div>
    </div>
  );
};
