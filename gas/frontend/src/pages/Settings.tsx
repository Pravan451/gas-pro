// src/pages/settings.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Bell, Save } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface SystemSettings {
  notifications: {
    emailAlerts: boolean;
    smsAlerts: boolean;
    soundAlerts: boolean;
    criticalOnly: boolean;
  };
  thresholds: {
    methane: { warning: number; danger: number };
    carbonMonoxide: { warning: number; danger: number };
    hydrogenSulfide: { warning: number; danger: number };
    naturalGas: { warning: number; danger: number };
  };
}

const Settings: React.FC = () => {
  const { toast } = useToast();
  const { token } = useAuth();

  const [settings, setSettings] = useState<SystemSettings>(() => {
    // load notifications from localStorage if exists
    const saved = localStorage.getItem("gasguard-notifications");
    return saved
      ? { ...JSON.parse(saved), thresholds: { methane: { warning: 50, danger: 100 }, carbonMonoxide: { warning: 35, danger: 70 }, hydrogenSulfide: { warning: 10, danger: 20 }, naturalGas: { warning: 25, danger: 50 } } }
      : {
          notifications: { emailAlerts: true, smsAlerts: true, soundAlerts: true, criticalOnly: false },
          thresholds: { methane: { warning: 50, danger: 100 }, carbonMonoxide: { warning: 35, danger: 70 }, hydrogenSulfide: { warning: 10, danger: 20 }, naturalGas: { warning: 25, danger: 50 } }
        };
  });

  const [hasChanges, setHasChanges] = useState(false);

  // Update notification switches (saved in localStorage only)
  const updateNotification = (key: keyof SystemSettings['notifications'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value }
    }));
    setHasChanges(true);
    localStorage.setItem("gasguard-notifications", JSON.stringify({ ...settings.notifications, [key]: value }));
  };

  // Update thresholds (saved to backend)
  const updateThreshold = (gasType: keyof SystemSettings['thresholds'], type: 'warning' | 'danger', value: number) => {
    setSettings(prev => ({
      ...prev,
      thresholds: { ...prev.thresholds, [gasType]: { ...prev.thresholds[gasType], [type]: value } }
    }));
    setHasChanges(true);
  };

  // Fetch thresholds from backend on load
  useEffect(() => {
    const fetchThresholds = async () => {
      try {
        if (!token) return;
        const res = await fetch("http://localhost:5000/api/settings/thresholds", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch thresholds");
        const data = await res.json();
        if (data) setSettings(prev => ({ ...prev, thresholds: data }));
      } catch (err) {
        console.error(err);
        toast({ title: "Error", description: "Could not load thresholds." });
      }
    };
    fetchThresholds();
  }, [token, toast]);

  // Save thresholds to backend only
  const saveSettings = async () => {
    try {
      if (!token) return toast({ title: "Error", description: "No auth token found — please log in." });

      const res = await fetch("http://localhost:5000/api/settings/thresholds", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(settings.thresholds),
      });

      if (!res.ok) throw new Error("Failed to save thresholds");
      toast({ title: "Saved", description: "Thresholds updated successfully!" });
      setHasChanges(false);
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to save thresholds. Please try again." });
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-3"><Bell className="h-8 w-8 text-primary" /> System Settings</h1>
        <Button onClick={saveSettings} disabled={!hasChanges}>
          <Save className="h-5 w-5 mr-2" /> Save Settings
        </Button>
      </div>

      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted/20">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="thresholds">Thresholds</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          <Card className="industrial-card mt-4">
            <CardHeader><CardTitle>Alert Notifications</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(settings.notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <Label>{key.replace(/([A-Z])/g, ' $1')}</Label>
                  <Switch checked={value} onCheckedChange={val => updateNotification(key as keyof SystemSettings['notifications'], val)} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="thresholds">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 mt-4">
            <Card className="industrial-card">
              <CardHeader><CardTitle>Gas Detection Thresholds</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(settings.thresholds).map(([gas, t]) => (
                  <div key={gas} className="p-4 bg-muted/20 rounded-lg">
                    <h3 className="font-semibold mb-4 capitalize">{gas}</h3>
                    {(['warning','danger'] as const).map(type => (
                      <div key={type} className="space-y-2 mb-2">
                        <Label>{type.charAt(0).toUpperCase() + type.slice(1)} Threshold (ppm)</Label>
                        <Input
                          type="number"
                          value={t[type]}
                          onChange={e => updateThreshold(gas as keyof SystemSettings['thresholds'], type, parseInt(e.target.value))}
                          className="bg-input"
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
