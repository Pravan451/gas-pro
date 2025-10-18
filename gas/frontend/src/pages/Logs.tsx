import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  FileText, Search, Filter, Download, 
  AlertTriangle, CheckCircle, Clock, User 
} from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface LogEntry {
  _id: string;
  timestamp: string | Date;
  type: 'sensor_reading' | 'valve_operation' | 'alert' | 'system' | 'user_action';
  severity: 'info' | 'warning' | 'error' | 'critical';
  source: string;
  message: string;
  user?: string;
  gasPPM?: number; // for sensor reading
  temperature?: number; // for sensor reading
}

const Logs: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('gasguard-token');

        if (!token) {
          setError('⚠️ Not logged in. Please login first.');
          setLoading(false);
          return;
        }

        // ✅ Fetch sensor data as system logs
        const res = await axios.get('http://localhost:5000/data', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const sensorLogs: LogEntry[] = res.data.map((d: any) => ({
          _id: d.sensorId + '-' + new Date(d.timestamp).getTime(),
          timestamp: d.timestamp,
          type: 'sensor_reading',
          severity:
            d.level >= d.threshold?.danger
              ? 'critical'
              : d.level >= d.threshold?.warning
              ? 'warning'
              : 'info',
          source: d.name,
          message: `Gas Level: ${d.level} ${d.unit}, Temperature: ${d.temperature}°C`,
          gasPPM: d.level,
          temperature: d.temperature,
        }));

        // Optional: fetch system/user/valve logs from /logs endpoint
        const logRes = await axios.get('http://localhost:5000/logs', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const otherLogs: LogEntry[] = Array.isArray(logRes.data)
          ? logRes.data.map((log: any) => ({
              _id: log._id,
              timestamp: log.timestamp,
              type: log.type,
              severity: log.severity || 'info',
              source: log.source || 'System',
              message: log.message,
              user: log.user || '-',
            }))
          : [];

        const combinedLogs = [...sensorLogs, ...otherLogs].sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        setLogs(combinedLogs);
      } catch (err: any) {
        console.error('Fetch logs error:', err.message);
        setError('Failed to fetch logs. Showing fallback logs.');
        // fallback logs
        setLogs([
          { _id: '1', timestamp: new Date(), type: 'system', severity: 'info', source: 'System', message: 'System initialized', user: 'admin' },
          { _id: '2', timestamp: new Date(), type: 'sensor_reading', severity: 'warning', source: 'GasSensor01', message: 'Gas above threshold', gasPPM: 75, temperature: 28 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.source?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || log.type === filterType;
    const matchesSeverity = filterSeverity === 'all' || log.severity === filterSeverity;
    return matchesSearch && matchesType && matchesSeverity;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return { variant: 'destructive' as const, icon: AlertTriangle, className: 'emergency-pulse' };
      case 'error': return { variant: 'destructive' as const, icon: AlertTriangle, className: '' };
      case 'warning': return { variant: 'secondary' as const, icon: AlertTriangle, className: '' };
      case 'info': return { variant: 'outline' as const, icon: CheckCircle, className: '' };
      default: return { variant: 'outline' as const, icon: CheckCircle, className: '' };
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sensor_reading': return Clock;
      case 'valve_operation': return CheckCircle;
      case 'alert': return AlertTriangle;
      case 'system': return CheckCircle;
      case 'user_action': return User;
      default: return FileText;
    }
  };

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Type', 'Severity', 'Source', 'Message', 'User'],
      ...filteredLogs.map((log) => [
        new Date(log.timestamp).toISOString(),
        log.type,
        log.severity,
        log.source,
        log.message,
        log.user || '',
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gasguard-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) return <div className="p-6 text-center">Loading logs...</div>;

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" /> System Logs
          </h1>
          <p className="text-muted-foreground">Comprehensive audit trail and system history</p>
        </div>
        <Button onClick={exportLogs} className="safety-button bg-gradient-primary hover:shadow-industrial">
          <Download className="h-5 w-5 mr-2" /> Export Logs
        </Button>
      </div>

      {/* Filters */}
      <Card className="industrial-card">
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-input"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="bg-input">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="sensor_reading">Sensor Reading</SelectItem>
              <SelectItem value="valve_operation">Valve Operation</SelectItem>
              <SelectItem value="alert">Alert</SelectItem>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="user_action">User Action</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterSeverity} onValueChange={setFilterSeverity}>
            <SelectTrigger className="bg-input">
              <SelectValue placeholder="Filter by severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{filteredLogs.length} of {logs.length} entries</span>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="industrial-card">
          <CardHeader><CardTitle>Activity Log</CardTitle></CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>User</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log, index) => {
                  const TypeIcon = getTypeIcon(log.type);
                  const severityBadge = getSeverityBadge(log.severity);
                  const SeverityIcon = severityBadge.icon;
                  return (
                    <motion.tr
                      key={log._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.03 * index }}
                      className="border-border hover:bg-muted/20 transition-colors"
                    >
                      <TableCell className="font-mono text-sm">
                        <div>{new Date(log.timestamp).toLocaleDateString()}</div>
                        <div className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleTimeString()}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <TypeIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="capitalize text-sm">{log.type.replace('_', ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={severityBadge.variant} className={`flex items-center gap-1 ${severityBadge.className}`}>
                          <SeverityIcon className="h-3 w-3" />
                          {log.severity.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{log.source}</TableCell>
                      <TableCell className="max-w-md text-sm break-words">{log.message}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{log.user || '-'}</TableCell>
                    </motion.tr>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Logs;
