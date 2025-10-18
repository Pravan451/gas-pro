import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Activity, AlertTriangle, TrendingUp, Thermometer } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSensors } from '@/contexts/SensorContext';
import axios from 'axios';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface ChartDataPoint {
  time: string;
  [sensorId: string]: number | string;
}

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const Dashboard: React.FC = () => {
  const { sensors, emergencyShutdown } = useSensors();
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [timeRange, setTimeRange] = useState<'30s' | '60s'>('30s'); // updated

  // Register push notifications
  useEffect(() => {
    const registerPush = async () => {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

      try {
        const reg = await navigator.serviceWorker.register('/service-worker.js');
        const existingSub = await reg.pushManager.getSubscription();
        if (existingSub) return;
        if (!VAPID_PUBLIC_KEY) return;

        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });

        await axios.post(`${BACKEND_URL}/push/subscribe`, sub);
      } catch (err) {
        console.error('Push registration failed', err);
      }
    };
    registerPush();
  }, []);

  // Fetch sensor data periodically
  useEffect(() => {
    const fetchData = async () => {
      try {
        await axios.get(`${BACKEND_URL}/data`);
      } catch {}
    };
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  // Update chart data
  useEffect(() => {
    const now = new Date();
    setChartData(prevData => {
      const newPoint: ChartDataPoint = { time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      sensors.forEach(sensor => (newPoint[sensor.id] = sensor.level));
      // Limit chart points based on timeRange
      const maxPoints = timeRange === '30s' ? 10 : 20; // example: 10 points ~ 30s, 20 points ~ 60s
      return [...prevData, newPoint].slice(-maxPoints);
    });
  }, [sensors, timeRange]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: { position: 'top' as const, labels: { color: 'hsl(var(--foreground))', usePointStyle: true, pointStyle: 'circle' } },
      title: { display: true, text: 'Real-Time Gas Level Monitoring', color: 'hsl(var(--foreground))' },
      tooltip: { backgroundColor: 'hsl(var(--card))', titleColor: 'hsl(var(--foreground))', bodyColor: 'hsl(var(--foreground))', borderColor: 'hsl(var(--border))', borderWidth: 1 }
    },
    scales: {
      x: { grid: { color: 'hsl(var(--border)/0.3)' }, ticks: { color: 'hsl(var(--muted-foreground))' } },
      y: { beginAtZero: true, grid: { color: 'hsl(var(--border)/0.3)' }, ticks: { color: 'hsl(var(--muted-foreground))', callback: (v: any) => v + ' ppm' } }
    }
  };

  const getChartData = () => {
    const colors = [
      { border: 'hsl(var(--primary))', bg: 'hsl(var(--primary)/0.1)' },
      { border: 'hsl(var(--success))', bg: 'hsl(var(--success)/0.1)' },
      { border: 'hsl(var(--warning))', bg: 'hsl(var(--warning)/0.1)' },
      { border: 'hsl(var(--destructive))', bg: 'hsl(var(--destructive)/0.1)' }
    ];
    return {
      labels: chartData.map(p => p.time),
      datasets: sensors.map((s, i) => ({
        label: s.roomName,
        data: chartData.map(p => p[s.id] as number),
        borderColor: colors[i % colors.length].border,
        backgroundColor: colors[i % colors.length].bg,
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: colors[i % colors.length].border,
        pointBorderColor: colors[i % colors.length].border,
        pointRadius: 3,
        pointHoverRadius: 5
      }))
    };
  };

  const getStatusCounts = () => ({
    online: sensors.filter(s => s.status === 'online').length,
    warning: sensors.filter(s => s.status === 'warning').length,
    danger: sensors.filter(s => s.status === 'danger').length,
    offline: sensors.filter(s => s.status === 'offline').length
  });

  const statusCounts = getStatusCounts();
  const criticalSensors = sensors.filter(s => s.status === 'danger');

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Critical Alert Banner */}
      {criticalSensors.length > 0 && (
        <div className="p-4 bg-destructive text-destructive-foreground rounded-lg flex items-center gap-3 animate-pulse">
          <AlertTriangle className="h-6 w-6" />
          <span className="font-bold text-lg">
            ⚠️ Critical Gas Leak Detected in {criticalSensors.map(s => s.roomName).join(', ')}! Immediate action required.
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Activity className="h-8 w-8 text-primary" /> Safety Dashboard
          </h1>
          <p className="text-muted-foreground">Real-time gas monitoring and system status</p>
        </div>
        {criticalSensors.length > 0 && (
          <Button 
            onClick={() => {
              emergencyShutdown?.();
              alert('🚨 Emergency Shutdown Activated!');
            }} 
            className="bg-gradient-danger hover:shadow-danger text-destructive-foreground emergency-pulse"
          >
            <AlertTriangle className="h-5 w-5 mr-2" /> Emergency Shutdown
          </Button>
        )}
      </div>

      {/* Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card className="industrial-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" /> Gas Level Trends</CardTitle>
            <div className="flex gap-2">
              {(['30s','60s'] as const).map(r => (
                <Button key={r} variant={timeRange === r ? 'default' : 'outline'} size="sm" onClick={() => setTimeRange(r)}>{r}</Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">{chartData.length > 0 && <Line data={getChartData()} options={chartOptions} />}</div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ✅ Sensor Status Details */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Card className="industrial-card">
          <CardHeader><CardTitle className="flex items-center gap-2"><Thermometer className="h-5 w-5 text-primary" /> Sensor Status Details</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {sensors.map((sensor, i) => (
                <motion.div key={sensor.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1*i }} className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                  sensor.status==='danger' ? 'border-destructive bg-destructive/10 emergency-pulse' :
                  sensor.status==='warning' ? 'border-warning bg-warning/10' :
                  sensor.status==='online' ? 'border-success/30 bg-success/5' :
                  'border-muted bg-muted/20'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        sensor.status==='online' ? 'sensor-online status-pulse' :
                        sensor.status==='warning' ? 'sensor-warning status-pulse' :
                        sensor.status==='danger' ? 'sensor-danger' :
                        'sensor-offline'
                      }`} />
                      <h3 className="font-semibold text-foreground">{sensor.roomName}</h3>
                    </div>
                    <Badge variant={
                      sensor.status==='danger' ? 'destructive' :
                      sensor.status==='warning' ? 'secondary' :
                      sensor.status==='online' ? 'default' :
                      'outline'
                    }>{sensor.status.toUpperCase()}</Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between"><span className="text-sm text-muted-foreground">Current Level:</span>
                      <span className={`font-mono font-semibold ${
                        sensor.status==='danger' ? 'text-destructive' :
                        sensor.status==='warning' ? 'text-warning' :
                        'text-foreground'
                      }`}>{sensor.level} {sensor.unit}</span></div>

                    <div className="flex justify-between"><span className="text-sm text-muted-foreground">Warning Threshold:</span>
                      <span className="font-mono text-sm">{sensor.threshold.warning} {sensor.unit}</span></div>

                    <div className="flex justify-between"><span className="text-sm text-muted-foreground">Danger Threshold:</span>
                      <span className="font-mono text-sm text-destructive">{sensor.threshold.danger} {sensor.unit}</span></div>

                    <div className="flex justify-between"><span className="text-sm text-muted-foreground">Last Update:</span>
                      <span className="font-mono text-xs">{sensor.timestamp.toLocaleTimeString()}</span></div>
                  </div>

                  {sensor.level > sensor.threshold.danger && (
                    <div className="mt-3 p-3 bg-destructive/20 border border-destructive rounded-lg flex items-center gap-2 animate-pulse">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      <span className="font-bold text-destructive">⚠️ Gas Leak Detected! Immediate Action Required</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;
