import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Send,
  Bot,
  User,
  AlertTriangle,
  Lightbulb,
  Shield,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSensors } from "@/contexts/SensorContext";
import api from "@/lib/api";

/* ===================== TYPES ===================== */

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

/* ===================== COMPONENT ===================== */

const AIAssistant: React.FC = () => {
  const { sensors } = useSensors();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(scrollToBottom, [messages]);

  /* -------- WELCOME MESSAGE -------- */
  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        type: "assistant",
        content: `👋 Hello! I'm your **GasGuard Pro AI Safety Assistant**.

I can help you with:
• Gas level analysis  
• Emergency procedures  
• Valve recommendations  
• System optimization`,
        timestamp: new Date(),
        suggestions: [
          "Analyze current gas levels",
          "Emergency response procedures",
          "Valve control recommendations",
          "System optimization tips",
        ],
      },
    ]);
  }, []);

  /* -------- SEND MESSAGE TO BACKEND -------- */
  const sendToAssistant = async (text: string) => {
    try {
      setIsTyping(true);

      const res = await api.post("/assistant", {
        message: text,
        sensors, // optional context for future AI use
      });

      return {
        id: `assistant_${Date.now()}`,
        type: "assistant" as const,
        content: res.data.reply,
        timestamp: new Date(),
      };
    } catch (err) {
      console.error(err);
      return {
        id: `assistant_error_${Date.now()}`,
        type: "assistant" as const,
        content: "⚠️ Assistant service unavailable.",
        timestamp: new Date(),
      };
    } finally {
      setIsTyping(false);
    }
  };

  /* -------- HANDLE SEND -------- */
  const handleSendMessage = async (text?: string) => {
    const msgText = text ?? inputValue;
    if (!msgText.trim()) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      type: "user",
      content: msgText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    const assistantMessage = await sendToAssistant(msgText);
    setMessages((prev) => [...prev, assistantMessage]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /* ===================== UI ===================== */

  return (
    <div className="min-h-screen bg-background p-6 flex justify-center">
      <div className="max-w-6xl w-full flex gap-6">
        {/* CHAT PANEL */}
        <Card className="industrial-card flex-1 flex flex-col h-[80vh]">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI Assistant
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`flex gap-3 ${
                    m.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {m.type === "assistant" && (
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                  )}

                  <div className="max-w-[70%]">
                    <div
                      className={`p-3 rounded-lg whitespace-pre-line ${
                        m.type === "user"
                          ? "bg-primary text-white"
                          : "bg-muted/50"
                      }`}
                    >
                      {m.content}
                      <div className="text-xs opacity-60 mt-1">
                        {m.timestamp.toLocaleTimeString()}
                      </div>
                    </div>

                    {m.suggestions && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {m.suggestions.map((s, i) => (
                          <button
                            key={i}
                            onClick={() => handleSendMessage(s)}
                            className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full hover:bg-primary/20"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {m.type === "user" && (
                    <div className="p-2 bg-muted/50 rounded-full">
                      <User className="h-5 w-5" />
                    </div>
                  )}
                </motion.div>
              ))}

              {isTyping && (
                <div className="flex gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    Assistant is typing...
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="border-t p-4 flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about gas safety, valves, emergencies..."
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isTyping}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* QUICK ACTIONS */}
        <Card className="industrial-card w-72 h-[80vh]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button onClick={() => handleSendMessage("Analyze current gas levels")} className="justify-start gap-2">
              <Shield /> Safety Analysis
            </Button>
            <Button onClick={() => handleSendMessage("Emergency response procedures")} className="justify-start gap-2">
              <AlertTriangle /> Emergency
            </Button>
            <Button onClick={() => handleSendMessage("Valve control recommendations")} className="justify-start gap-2">
              <Clock /> Valve Control
            </Button>
            <Button onClick={() => handleSendMessage("System optimization tips")} className="justify-start gap-2">
              <TrendingUp /> Optimization
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIAssistant;
