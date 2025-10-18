import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Send, Bot, User, AlertTriangle, 
  CheckCircle, Lightbulb, Shield, TrendingUp, Clock 
} from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSensors } from '@/contexts/SensorContext';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

const AIAssistant: React.FC = () => {
  const { sensors } = useSensors();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => scrollToBottom(), [messages]);

  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      type: 'assistant',
      content: `👋 Hello! I'm your **GasGuard Pro AI Safety Assistant**. 
I can:
• Analyze gas levels  
• Recommend safety protocols  
• Guide emergency response  
• Suggest optimizations`,
      timestamp: new Date(),
      suggestions: [
        'Analyze current gas levels',
        'Check for safety violations',
        'Emergency response procedures',
        'System optimization tips'
      ]
    };
    setMessages([welcomeMessage]);
  }, []);

  const generateAIResponse = async (userMessage: string): Promise<Message> => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    let response = 'I understood your request.';
    let suggestions: string[] = [];
    const message = userMessage.toLowerCase();

    const criticalSensors = sensors.filter(s => s.status === 'danger');
    const warningSensors = sensors.filter(s => s.status === 'warning');

    if (message.includes('gas') || message.includes('analyze')) {
      response = `📊 Gas Levels:\n${sensors.map(s => `• ${s.roomName}: ${s.level} ${s.unit} → ${s.status}`).join('\n')}`;
      suggestions = ['Emergency response', 'Valve shutdown', 'Safety recommendations'];
    } else if (message.includes('emergency') || message.includes('evacuate')) {
      response = `🚨 Emergency Protocol:\n1. Evacuate affected areas\n2. Shut valves\n3. Call emergency services`;
      suggestions = ['Valve control', 'Post-incident recovery'];
    } else if (message.includes('valve')) {
      response = `🔧 Valve Recommendations:\n${sensors.map(s => `• ${s.roomName}: ${s.status === 'danger' ? 'Close' : 'Normal'}`).join('\n')}`;
      suggestions = ['Emergency valve shutdown', 'Maintenance schedule'];
    } else if (message.includes('optim') || message.includes('improve')) {
      response = `⚡ Optimization Tips:\n1. Auto-valve closure\n2. Predictive maintenance\n3. Sensor calibration`;
      suggestions = ['Predictive maintenance', 'Automation setup'];
    }

    return { id: `assistant_${Date.now()}`, type: 'assistant', content: response, timestamp: new Date(), suggestions };
  };

  const handleSendMessage = async (text?: string) => {
    const msgText = text ?? inputValue;
    if (!msgText.trim()) return;

    const userMessage: Message = { id: `user_${Date.now()}`, type: 'user', content: msgText, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    const assistantMessage = await generateAIResponse(msgText);
    setMessages(prev => [...prev, assistantMessage]);
    setIsTyping(false);
  };

  const handleSuggestionClick = (suggestion: string) => handleSendMessage(suggestion);
  const handleKeyPress = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } };

  return (
    <div className="min-h-screen bg-background p-6 flex justify-center">
      <div className="max-w-6xl w-full flex gap-6">
        {/* Chat Panel */}
        <Card className="industrial-card flex-1 flex flex-col h-[80vh]">
          <CardHeader className="pb-4 border-b border-border">
            <CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5 text-primary" /> Chat</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(m => (
                <motion.div key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`flex gap-3 ${m.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.type === 'assistant' && <div className="p-2 bg-primary/10 rounded-full"><Bot className="h-5 w-5 text-primary" /></div>}
                  <div className={`max-w-[70%] ${m.type === 'user' ? 'order-2' : ''}`}>
                    <div className={`p-3 rounded-lg whitespace-pre-line ${m.type === 'user' ? 'bg-primary text-white' : 'bg-muted/50'}`}>{m.content}<div className="text-xs opacity-70 mt-1">{m.timestamp.toLocaleTimeString()}</div></div>
                    {m.suggestions && <div className="flex flex-wrap gap-2 mt-2">{m.suggestions.map((s, i) => <button key={i} onClick={() => handleSuggestionClick(s)} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full hover:bg-primary/20">{s}</button>)}</div>}
                  </div>
                  {m.type === 'user' && <div className="p-2 bg-muted/50 rounded-full order-1"><User className="h-5 w-5" /></div>}
                </motion.div>
              ))}
              {isTyping && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-3"><div className="p-2 bg-primary/10 rounded-full"><Bot className="h-5 w-5 text-primary" /></div><div className="bg-muted/50 p-3 rounded-lg flex gap-1"><div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" /><div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" /><div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" /></div></motion.div>}
              <div ref={messagesEndRef} />
            </div>
            <div className="border-t p-4 flex gap-2">
              <Input value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyPress={handleKeyPress} placeholder="Ask about gas levels, safety or emergency..." />
              <Button onClick={() => handleSendMessage()} disabled={!inputValue.trim() || isTyping}><Send className="h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Insights Side Panel */}
        <Card className="industrial-card w-72 flex-shrink-0 h-[80vh] flex flex-col">
          <CardHeader><CardTitle><Lightbulb className="h-5 w-5 text-primary" /> Quick Insights</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button onClick={() => handleSendMessage('Analyze current gas levels')} className="justify-start gap-2"><Shield /> Safety Analysis</Button>
            <Button onClick={() => handleSendMessage('Emergency response procedures')} className="justify-start gap-2"><AlertTriangle /> Emergency</Button>
            <Button onClick={() => handleSendMessage('System optimization recommendations')} className="justify-start gap-2"><TrendingUp /> Optimization</Button>
            <Button onClick={() => handleSendMessage('Valve control recommendations')} className="justify-start gap-2"><Clock /> Valve Control</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIAssistant;
