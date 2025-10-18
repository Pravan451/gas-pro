import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Edit, Save, Camera, Shield, Clock, MapPin, Phone, Mail } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

const Profile: React.FC = () => {
  const { user, token, setUser } = useAuth() as any;
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '+1 (555) 123-4567',
    department: user?.department || '',
    role: user?.role || '',
    location: 'Industrial Complex A',
    emergencyContact: '+1 (555) 987-6543',
    certifications: ['Gas Detection Safety', 'Emergency Response', 'Industrial Safety'],
    joinDate: '2023-01-15'
  });

  const updateField = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const saveProfile = async () => {
    if (!user || !token) return;

    try {
      const res = await axios.put(
        'http://localhost:5000/profile/update',
        {
          name: profileData.name,
          phone: profileData.phone,
          department: profileData.department
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (res.data && res.data.user) {
        setProfileData(prev => ({
          ...prev,
          name: res.data.user.name,
          phone: res.data.user.phone,
          department: res.data.user.department
        }));

        toast({
          title: 'Profile Updated',
          description: 'Your profile information has been saved successfully.',
        });

        // Update AuthContext
        setUser(res.data.user);
        localStorage.setItem('gasguard-user', JSON.stringify(res.data.user));
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Profile update error:', err);
      toast({
        title: 'Update failed',
        description: 'Could not update profile. Check server console.',
      });
    }
  };

  const clearanceLevels = {
    1: { label: 'Basic', color: 'bg-muted text-muted-foreground' },
    2: { label: 'Standard', color: 'bg-primary/10 text-primary' },
    3: { label: 'Advanced', color: 'bg-success/10 text-success' },
    4: { label: 'Expert', color: 'bg-warning/10 text-warning' },
    5: { label: 'Administrator', color: 'bg-destructive/10 text-destructive' }
  };

  const activityLog = [
    { action: 'Logged into system', time: '2 hours ago', type: 'login' },
    { action: 'Reviewed gas level alerts', time: '3 hours ago', type: 'monitoring' },
    { action: 'Closed valve in Production Floor A', time: '5 hours ago', type: 'valve' },
    { action: 'Updated safety thresholds', time: '1 day ago', type: 'settings' },
    { action: 'Generated safety report', time: '2 days ago', type: 'report' }
  ];

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <User className="h-8 w-8 text-primary" />
            User Profile
          </h1>
          <p className="text-muted-foreground">Manage your account information and safety credentials</p>
        </div>
        
        <div className="flex gap-2">
          {isEditing ? (
            <Button onClick={saveProfile} className="safety-button bg-gradient-success hover:shadow-success">
              <Save className="h-5 w-5 mr-2" /> Save Changes
            </Button>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="safety-button bg-gradient-primary hover:shadow-industrial">
              <Edit className="h-5 w-5 mr-2" /> Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="industrial-card">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24 border-4 border-primary/20">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl">
                        {user?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <Button size="sm" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0">
                        <Camera className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <h2 className="text-2xl font-bold text-foreground">{profileData.name}</h2>
                    <p className="text-muted-foreground">{profileData.role}</p>
                    <div className="flex items-center gap-2">
                      <Badge className={clearanceLevels[user?.clearanceLevel as keyof typeof clearanceLevels]?.color}>
                        Clearance Level {user?.clearanceLevel}: {clearanceLevels[user?.clearanceLevel as keyof typeof clearanceLevels]?.label}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input value={profileData.name} onChange={(e) => updateField('name', e.target.value)} disabled={!isEditing} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={profileData.email} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input value={profileData.phone} onChange={(e) => updateField('phone', e.target.value)} disabled={!isEditing} />
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Input value={profileData.department} onChange={(e) => updateField('department', e.target.value)} disabled={!isEditing} />
                  </div>
                  <div className="space-y-2">
                    <Label>Work Location</Label>
                    <Input value={profileData.location} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Emergency Contact</Label>
                    <Input value={profileData.emergencyContact} disabled />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Certifications */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="industrial-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" /> Safety Certifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profileData.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-success/10 rounded-lg border border-success/30">
                      <div className="w-3 h-3 bg-success rounded-full" />
                      <span className="font-medium text-success">{cert}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <Card className="industrial-card">
              <CardHeader>
                <CardTitle>Account Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Member Since</p>
                    <p className="font-semibold">{new Date(profileData.joinDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-semibold">{profileData.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Emergency Contact</p>
                    <p className="font-semibold">{profileData.emergencyContact}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <Card className="industrial-card">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activityLog.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 pb-3 border-b border-border last:border-0">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.type === 'login' ? 'bg-primary' :
                        activity.type === 'valve' ? 'bg-success' :
                        activity.type === 'monitoring' ? 'bg-warning' :
                        'bg-muted'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
