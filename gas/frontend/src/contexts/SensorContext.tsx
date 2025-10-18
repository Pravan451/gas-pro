import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface SensorReading {
  id: string;
  roomId: string;
  roomName: string;
  gasType: string;
  level: number;
  unit: string;
  status: 'online' | 'warning' | 'danger' | 'offline';
  timestamp: Date;
  threshold: {
    warning: number;
    danger: number;
  };
}

interface ValveStatus {
  id: string;
  roomId: string;
  name: string;
  isOpen: boolean;
  isLocked: boolean;
  lastOperation: Date;
}

interface SensorContextType {
  sensors: SensorReading[];
  valves: ValveStatus[];
  toggleValve: (valveId: string) => void;
  emergencyShutdown: () => void;
}

const SensorContext = createContext<SensorContextType | undefined>(undefined);

// INITIAL SENSORS: level = 0
const initialSensors: SensorReading[] = [
  { id: 'sensor_001', roomId: 'room_001', roomName: 'Kitchen', gasType: '', level: 0, unit: 'ppm', status: 'offline', timestamp: new Date(), threshold: { warning: 50, danger: 100 } },
  { id: 'sensor_002', roomId: 'room_002', roomName: 'Living Room', gasType: 'Carbon Monoxide (CO)', level: 0, unit: 'ppm', status: 'offline', timestamp: new Date(), threshold: { warning: 35, danger: 70 } },
  { id: 'sensor_003', roomId: 'room_003', roomName: 'Bed room', gasType: 'Hydrogen Sulfide (H2S)', level: 0, unit: 'ppm', status: 'offline', timestamp: new Date(), threshold: { warning: 10, danger: 20 } },
  { id: 'sensor_004', roomId: 'room_004', roomName: 'Boiler Room', gasType: 'Natural Gas', level: 0, unit: 'ppm', status: 'offline', timestamp: new Date(), threshold: { warning: 25, danger: 50 } }
];

const initialValves: ValveStatus[] = [
  { id: 'valve_001', roomId: 'room_001', name: 'Main Supply Valve A', isOpen: true, isLocked: false, lastOperation: new Date() },
  { id: 'valve_002', roomId: 'room_002', name: 'Emergency Shutoff B', isOpen: true, isLocked: false, lastOperation: new Date() },
  { id: 'valve_003', roomId: 'room_003', name: 'Chemical Feed Valve', isOpen: false, isLocked: true, lastOperation: new Date() },
  { id: 'valve_004', roomId: 'room_004', name: 'Boiler Gas Valve', isOpen: true, isLocked: false, lastOperation: new Date() }
];

export const SensorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sensors, setSensors] = useState<SensorReading[]>(initialSensors);
  const [valves, setValves] = useState<ValveStatus[]>(initialValves);

  // Fetch sensor data from backend every 3 seconds
 useEffect(() => {
  const fetchSensors = async () => {
    try {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZDAxMmZiNjkzNDQ4NTUyYTIwOTgyNyIsIm5hbWUiOiJQcmF2YW4iLCJpYXQiOjE3NTg0NjY4MTEsImV4cCI6MTc1OTA3MTYxMX0.u5MKI62QRqg4jFaeLD7NG4tahhrTobT6h4ulQ6vD8OE';
      
      const res = await axios.get('http://localhost:5000/data', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const updatedSensors = res.data.map((s: any) => ({
        id: s.sensorId,
        roomId: s.roomId,
        roomName: s.name,
        gasType: s.gasType || '',
        level: s.level || 0,
        unit: s.unit || 'ppm',
        status: s.level >= s.threshold?.danger ? 'danger' :
                s.level >= s.threshold?.warning ? 'warning' :
                'online',
        timestamp: new Date(s.timestamp || Date.now()),
        threshold: s.threshold || { warning: 50, danger: 100 }
      }));

      setSensors(updatedSensors);
    } catch (err) {
      console.error('Error fetching sensor data', err);
    }
  };

  fetchSensors();
  const interval = setInterval(fetchSensors, 3000);
  return () => clearInterval(interval);
}, []);

  const toggleValve = (valveId: string) => {
    setValves(prevValves =>
      prevValves.map(valve =>
        valve.id === valveId && !valve.isLocked
          ? { ...valve, isOpen: !valve.isOpen, lastOperation: new Date() }
          : valve
      )
    );
  };

  const emergencyShutdown = () => {
    setValves(prevValves =>
      prevValves.map(valve => ({ ...valve, isOpen: false, lastOperation: new Date() }))
    );
  };

  return (
    <SensorContext.Provider value={{ sensors, valves, toggleValve, emergencyShutdown }}>
      {children}
    </SensorContext.Provider>
  );
};

export const useSensors = (): SensorContextType => {
  const context = useContext(SensorContext);
  if (!context) throw new Error('useSensors must be used within a SensorProvider');
  return context;
};
