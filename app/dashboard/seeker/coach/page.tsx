"use client";

import { useState, useEffect, useRef } from "react";
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Sparkles,
  Trash2,
  Clock,
  ChevronRight,
  Brain,
  Briefcase,
  Target,
  Lightbulb,
  BookOpen,
  TrendingUp,
  Award,
  Users,
  Zap,
  ArrowRight,
  Menu,
  X,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

interface Message {
  id?: string;
  user_message: string;
  ai_response: string;
  role?: string;
  created_at?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function CoachPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Suggested questions for users
  const suggestions = [
    { icon: <Briefcase className="w-4 h-4" />, text: "How do I prepare for a job interview?" },
    { icon: <Target className="w-4 h-4" />, text: "What's the best way to negotiate salary?" },
    { icon: <Lightbulb className="w-4 h-4" />, text: "How can I improve my resume?" },
    { icon: <TrendingUp className="w-4 h-4" />, text: "What skills are in high demand right now?" },
    { icon: <Award className="w-4 h-4" />, text: "How do I ask for a promotion?" },
    { icon: <Users className="w-4 h-4" />, text: "Tips for networking effectively?" },
    { icon: <BookOpen className="w-4 h-4" />, text: "Should I pursue additional certifications?" },
    { icon: <Brain className="w-4 h-4" />, text: "How to handle career burnout?" },
  ];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch chat history on component mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        console.log("No token found, skipping history fetch");
        return;
      }

      const response = await fetch(`${API_URL}/api/jobCoach`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setMessages(data.data);
        if (data.data.length > 0) {
          setShowSuggestions(false);
        }
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    try {
      setLoading(true);
      setShowSuggestions(false);

      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Authentication token not found. Please login again.");
        return;
      }

      const response = await fetch(`${API_URL}/api/jobCoach`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: message.trim(),
          role: "Student",
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            user_message: message.trim(),
            ai_response: data.data.ai_response,
            created_at: new Date().toISOString(),
          },
        ]);
        setMessage("");
        toast.success("Response received!");
        // Close sidebar on mobile after sending
        if (isMobile && sidebarOpen) {
          setSidebarOpen(false);
        }
      } else {
        toast.error(data.message || "Failed to get response");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
    textareaRef.current?.focus();
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const clearChat = () => {
    if (confirm("Are you sure you want to clear the chat history?")) {
      setMessages([]);
      setShowSuggestions(true);
      toast.success("Chat history cleared");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">AI Career Coach</h1>
              <p className="text-xs text-gray-500">Your personal career advisor</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearChat}
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        {/* Desktop Header - Hidden on mobile */}
        <div className="hidden lg:block mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-md">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">AI Career Coach</h1>
                <p className="text-gray-500 mt-1">
                  Your personal career advisor powered by AI
                </p>
              </div>
            </div>
            {messages.length > 0 && (
              <Button
                variant="outline"
                onClick={clearChat}
                className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Chat
              </Button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 lg:gap-8">
          
          {/* Left Column - Info & Suggestions - Mobile Drawer */}
          <div className={`
            ${isMobile ? 'fixed inset-0 z-30 transition-transform duration-300 transform' : 'relative'}
            ${sidebarOpen && isMobile ? 'translate-x-0' : isMobile ? '-translate-x-full' : 'block'}
            lg:block lg:relative lg:translate-x-0
          `}>
            {isMobile && sidebarOpen && (
              <div 
                className="fixed inset-0 bg-black/50 z-30"
                onClick={() => setSidebarOpen(false)}
              />
            )}
            
            <div className={`
              space-y-4 lg:space-y-6 
              ${isMobile ? 'fixed top-0 left-0 h-full w-80 bg-white z-40 p-4 overflow-y-auto shadow-xl' : 'relative'}
              lg:sticky lg:top-6 h-fit
            `}>
              {/* Close button for mobile */}
              {isMobile && (
                <div className="flex justify-end mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarOpen(false)}
                    className="text-gray-500"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              )}

              {/* Welcome Card */}
              <Card className="border-gray-100 shadow-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <Zap className="w-5 h-5 lg:w-6 lg:h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base lg:text-lg">AI Career Assistant</h3>
                      <p className="text-white/80 text-xs lg:text-sm">Available 24/7</p>
                    </div>
                  </div>
                  <p className="text-white/90 text-xs lg:text-sm leading-relaxed">
                    Get personalized career advice, interview tips, resume reviews, 
                    salary negotiation strategies, and professional development guidance.
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-xs text-white/70">
                    <Sparkles className="w-3 h-3" />
                    <span>Powered by Advanced AI</span>
                  </div>
                </CardContent>
              </Card>

              {/* Features Card */}
              <Card className="border-gray-100 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                    <Sparkles className="w-4 h-4 lg:w-5 lg:h-5 text-indigo-600" />
                    What I Can Help With
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { icon: <Briefcase />, text: "Job Search Strategies", color: "text-blue-600" },
                      { icon: <Target />, text: "Interview Preparation", color: "text-green-600" },
                      { icon: <Lightbulb />, text: "Resume & Cover Letter Tips", color: "text-purple-600" },
                      { icon: <TrendingUp />, text: "Career Growth Advice", color: "text-orange-600" },
                      { icon: <Award />, text: "Salary Negotiation", color: "text-red-600" },
                      { icon: <Users />, text: "Networking Strategies", color: "text-indigo-600" },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className={`${item.color} flex-shrink-0`}>
                          {item.icon}
                        </div>
                        <span className="text-xs lg:text-sm text-gray-700">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Stats Card */}
              {messages.length > 0 && (
                <Card className="border-gray-100 shadow-lg">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                      <MessageCircle className="w-4 h-4 lg:w-5 lg:h-5 text-indigo-600" />
                      Chat Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs lg:text-sm text-gray-600">Total Messages</span>
                        <Badge className="bg-indigo-100 text-indigo-700 text-xs">
                          {messages.length}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs lg:text-sm text-gray-600">Last Active</span>
                        <span className="text-xs text-gray-500">
                          {messages.length > 0 && formatTime(messages[messages.length - 1].created_at)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Right Column - Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="border-gray-100 shadow-lg h-[calc(100vh-8rem)] lg:h-[calc(100vh-12rem)] flex flex-col">
              {/* Chat Header - Desktop */}
              <CardHeader className="hidden lg:block border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-100 rounded-lg">
                      <Bot className="w-4 h-4 text-indigo-600" />
                    </div>
                    <CardTitle className="text-lg">Career Coach Chat</CardTitle>
                  </div>
                  <Badge className="bg-green-100 text-green-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                    Online
                  </Badge>
                </div>
                <CardDescription>
                  Ask me anything about your career journey
                </CardDescription>
              </CardHeader>

              {/* Chat Header - Mobile */}
              <div className="lg:hidden p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-100 rounded-lg">
                      <Bot className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">Career Coach Chat</h3>
                      <p className="text-xs text-gray-500">Ask me anything</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 text-xs">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                    Online
                  </Badge>
                </div>
              </div>

              {/* Messages Container */}
              <CardContent className="flex-1 overflow-y-auto p-3 lg:p-4 space-y-3 lg:space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center px-4">
                    <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mb-3 lg:mb-4">
                      <Bot className="w-8 h-8 lg:w-10 lg:h-10 text-indigo-600" />
                    </div>
                    <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-2">
                      Welcome to AI Career Coach!
                    </h3>
                    <p className="text-xs lg:text-sm text-gray-500 max-w-md mb-4 lg:mb-6">
                      Start a conversation about your career goals, job search, 
                      or any professional challenge you're facing.
                    </p>
                    
                    {/* Suggestions Grid - Responsive */}
                    {showSuggestions && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                        {suggestions.slice(0, 6).map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSuggestionClick(suggestion.text)}
                            className="text-left p-2 lg:p-3 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
                          >
                            <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-700 group-hover:text-indigo-600">
                              {suggestion.icon}
                              <span className="flex-1 line-clamp-2">{suggestion.text}</span>
                              <ArrowRight className="w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {messages.map((msg, index) => (
                      <div key={index} className="space-y-2 lg:space-y-3">
                        {/* User Message */}
                        <div className="flex justify-end">
                          <div className="max-w-[85%] lg:max-w-[80%] bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl rounded-br-none p-2 lg:p-3 shadow-sm">
                            <div className="flex items-center gap-1 lg:gap-2 mb-1">
                              <User className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-white/80" />
                              <span className="text-xs font-medium text-white/80">You</span>
                              {msg.created_at && (
                                <span className="text-xs text-white/60 ml-1 lg:ml-2">
                                  {formatTime(msg.created_at)}
                                </span>
                              )}
                            </div>
                            <p className="text-xs lg:text-sm whitespace-pre-wrap break-words">{msg.user_message}</p>
                          </div>
                        </div>

                        {/* AI Response */}
                        <div className="flex justify-start">
                          <div className="max-w-[85%] lg:max-w-[80%] bg-gray-100 rounded-2xl rounded-bl-none p-2 lg:p-3 shadow-sm">
                            <div className="flex items-center gap-1 lg:gap-2 mb-1">
                              <Bot className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-indigo-600" />
                              <span className="text-xs font-medium text-indigo-600">Career Coach</span>
                            </div>
                            <p className="text-xs lg:text-sm text-gray-700 whitespace-pre-wrap break-words">{msg.ai_response}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Loading Indicator */}
                    {loading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-2xl rounded-bl-none p-2 lg:p-3 shadow-sm">
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-3 h-3 lg:w-4 lg:h-4 text-indigo-600 animate-spin" />
                            <span className="text-xs lg:text-sm text-gray-500">AI is thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </>
                )}
              </CardContent>

              {/* Input Area */}
              <div className="border-t border-gray-100 p-3 lg:p-4">
                <div className="flex gap-2 lg:gap-3">
                  <div className="flex-1">
                    <Textarea
                      ref={textareaRef}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything about your career..."
                      className="min-h-[60px] lg:min-h-[80px] resize-none border-gray-200 focus:border-indigo-300 focus:ring-indigo-200 text-sm lg:text-base"
                      disabled={loading}
                      rows={isMobile ? 2 : 3}
                    />
                  </div>
                  <Button
                    onClick={sendMessage}
                    disabled={loading || !message.trim()}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white h-auto px-4 lg:px-6"
                    size={isMobile ? "default" : "default"}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 lg:w-5 lg:h-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4 lg:w-5 lg:h-5 lg:mr-2" />
                        <span className="hidden lg:inline">Send</span>
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mt-2 lg:mt-3 text-center">
                  Press Enter to send, Shift + Enter for new line
                </p>
              </div>
            </Card>

            {/* Quick Tips Banner */}
            <Card className="mt-3 lg:mt-4 border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50">
              <CardContent className="py-2 lg:py-3 px-3 lg:px-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-3 h-3 lg:w-4 lg:h-4 text-amber-600 flex-shrink-0" />
                    <span className="text-xs lg:text-sm text-amber-800 font-medium">Pro Tip:</span>
                    <span className="text-xs lg:text-sm text-amber-700">
                      Be specific about your industry and role for personalized advice!
                    </span>
                  </div>
                  <Badge variant="outline" className="border-amber-300 text-amber-700 text-xs whitespace-nowrap">
                    Free Career Advice
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}