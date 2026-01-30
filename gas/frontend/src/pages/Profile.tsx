import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Edit, Save, Camera, Shield, Clock, MapPin, Phone } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';   // ✅ changed

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

  /* ===================== ONLY CHANGE IS HERE ===================== */
  const saveProfile = async () => {
    if (!user || !token) return;

    try {
      const res = await api.put(
        '/profile/update',
        {
          name: profileData.name,
          phone: profileData.phone,
          department: profileData.department
        }
      );

      if (res.data?.user) {
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

        setUser(res.data.user);
        localStorage.setItem('gasguard-user', JSON.stringify(res.data.user));
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Profile update error:', err);
      toast({
        title: 'Update failed',
        description: 'Could not update profile.',
      });
    }
  };
  /* =============================================================== */

  const clearanceLevels: any = {
    1: { label: 'Basic', color: 'bg-muted text-muted-foreground' },
    2: { label: 'Standard', color: 'bg-primary/10 text-primary' },
    3: { label: 'Advanced', color: 'bg-success/10 text-success' },
    4: { label: 'Expert', color: 'bg-warning/10 text-warning' },
    5: { label: 'Administrator', color: 'bg-destructive/10 text-destructive' }
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <User className="h-8 w-8 text-primary" />
          User Profile
        </h1>

        {isEditing ? (
          <Button onClick={saveProfile}>
            <Save className="h-5 w-5 mr-2" /> Save
          </Button>
        ) : (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="h-5 w-5 mr-2" /> Edit
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
          </Avatar>

          <Label>Name</Label>
          <Input value={profileData.name} onChange={e => updateField('name', e.target.value)} disabled={!isEditing} />

          <Label>Email</Label>
          <Input value={profileData.email} disabled />

          <Label>Phone</Label>
          <Input value={profileData.phone} onChange={e => updateField('phone', e.target.value)} disabled={!isEditing} />

          <Label>Department</Label>
          <Input value={profileData.department} onChange={e => updateField('department', e.target.value)} disabled={!isEditing} />

          <Badge className={clearanceLevels[user?.clearanceLevel]?.color}>
            Clearance Level {user?.clearanceLevel}
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
