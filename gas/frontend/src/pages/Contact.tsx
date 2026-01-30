import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, Send, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';


const Contact: React.FC = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    priority: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
   await api.post('/contact/send', formData);

toast({
  title: "Message Sent Successfully",
  description: "The fire station has received your message.",
});

  } catch (err) {
    toast({
      title: "Network Error",
      description: "Could not reach the server.",
    });
  } finally {
    setIsSubmitting(false);
  }
};

  const emergencyContacts = [
    {
      title: 'Emergency Response',
      phone: '911',
      description: 'Life-threatening emergencies',
      icon: AlertTriangle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10'
    },
    {
      title: 'Safety Hotline',
      phone: '+1 (555) SAFETY-1',
      description: '24/7 safety incident reporting',
      icon: Phone,
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      title: 'Technical Support',
      phone: '+1 (555) 123-TECH',
      description: 'System issues and maintenance',
      icon: CheckCircle,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Operations Center',
      phone: '+1 (555) 456-7890',
      description: 'General operations and coordination',
      icon: Clock,
      color: 'text-success',
      bgColor: 'bg-success/10'
    }
  ];

  const officeLocations = [
    {
      title: 'Main Office',
      address: '123 Industrial Blvd, Safety City, SC 12345',
      hours: 'Mon-Fri: 8:00 AM - 6:00 PM',
      phone: '+1 (555) 123-4567'
    },
    {
      title: 'Emergency Control Center',
      address: '456 Monitoring Way, Safety City, SC 12346',
      hours: '24/7 Operations',
      phone: '+1 (555) 987-6543'
    }
  ];

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-3 mb-4">
          <Phone className="h-8 w-8 text-primary" />
          Contact Support
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Get help with GasGuard Pro V7, report issues, or contact our safety experts
        </p>
      </div>

      {/* Emergency Contacts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {emergencyContacts.map((contact, index) => {
          const Icon = contact.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card className={`industrial-card border-2 hover:shadow-lg transition-all cursor-pointer ${contact.bgColor} border-border`}>
                <CardContent className="p-6 text-center">
                  <div className={`p-3 ${contact.bgColor} rounded-full inline-block mb-4`}>
                    <Icon className={`h-6 w-6 ${contact.color}`} />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{contact.title}</h3>
                  <p className={`text-lg font-mono font-bold mb-2 ${contact.color}`}>
                    {contact.phone}
                  </p>
                  <p className="text-sm text-muted-foreground">{contact.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="industrial-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Send Message
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      placeholder="Enter your full name"
                      className="bg-input"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="Enter your email"
                      className="bg-input"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => updateField('subject', e.target.value)}
                    placeholder="Brief description of your inquiry"
                    className="bg-input"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => updateField('category', value)}>
                      <SelectTrigger className="bg-input">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Technical Support</SelectItem>
                        <SelectItem value="safety">Safety Issue</SelectItem>
                        <SelectItem value="billing">Billing & Account</SelectItem>
                        <SelectItem value="feature">Feature Request</SelectItem>
                        <SelectItem value="training">Training & Documentation</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={formData.priority} onValueChange={(value) => updateField('priority', value)}>
                      <SelectTrigger className="bg-input">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => updateField('message', e.target.value)}
                    placeholder="Describe your issue or inquiry in detail..."
                    rows={5}
                    className="bg-input"
                    required
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full safety-button bg-gradient-primary hover:shadow-industrial"
                >
                  {isSubmitting ? (
                    'Sending Message...'
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contact Information */}
        <div className="space-y-6">
          {/* Office Locations */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="industrial-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Office Locations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {officeLocations.map((location, index) => (
                  <div key={index} className="p-4 bg-muted/20 rounded-lg">
                    <h3 className="font-semibold text-foreground mb-2">{location.title}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{location.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{location.hours}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{location.phone}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Support Resources */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="industrial-card">
              <CardHeader>
                <CardTitle>Support Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                    <span className="font-medium">Documentation</span>
                    <span className="text-primary text-sm">View Guides</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                    <span className="font-medium">Video Tutorials</span>
                    <span className="text-primary text-sm">Watch Now</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                    <span className="font-medium">FAQ</span>
                    <span className="text-primary text-sm">Browse</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                    <span className="font-medium">Community Forum</span>
                    <span className="text-primary text-sm">Join Discussion</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;