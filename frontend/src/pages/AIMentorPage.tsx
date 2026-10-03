import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Loader2, Sparkles, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../layouts/Navbar';

interface Message {
  id: string | number;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Custom Markdown Components for high-end styling
const MarkdownComponents = {
  table: ({node, ...props}: any) => (
    <div className="w-full overflow-x-auto rounded-xl shadow-md border border-[#1B5442]/10 my-6 bg-white animate-fade-in-up" style={{ animationDuration: '0.6s' }}>
      <table className="w-full text-sm text-left text-gray-700" {...props} />
    </div>
  ),
  thead: ({node, ...props}: any) => <thead className="text-xs text-white uppercase bg-gradient-to-r from-[#1B5442] to-[#143d30]" {...props} />,
  th: ({node, ...props}: any) => <th className="px-6 py-4 font-bold tracking-wider" {...props} />,
  tbody: ({node, ...props}: any) => <tbody className="divide-y divide-gray-100" {...props} />,
  tr: ({node, ...props}: any) => <tr className="hover:bg-[#1B5442]/5 transition-colors duration-200" {...props} />,
  td: ({node, ...props}: any) => <td className="px-6 py-4 align-middle" {...props} />,
  a: ({node, ...props}: any) => (
    <a 
      className="inline-flex items-center gap-1 font-semibold text-[#1B5442] hover:text-[#143d30] transition-colors border-b border-[#1B5442]/30 hover:border-[#1B5442]" 
      {...props} 
    />
  ),
  h1: ({node, ...props}: any) => <h1 className="text-xl font-bold text-[#1B5442] mt-4 mb-2" {...props} />,
  h2: ({node, ...props}: any) => <h2 className="text-lg font-bold text-[#1A1A2E] mt-4 mb-2" {...props} />,
  h3: ({node, ...props}: any) => <h3 className="text-md font-bold text-[#1A1A2E] mt-3 mb-2" {...props} />,
  p: ({node, ...props}: any) => <p className="mb-3 leading-relaxed" {...props} />,
  ul: ({node, ...props}: any) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
  li: ({node, ...props}: any) => <li className="" {...props} />
};

const AIMentorPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (user && messages.length === 0) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/ai/chat/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          setMessages(data);
        } else {
          setMessages([
            {
              id: 'welcome',
              role: 'assistant',
              content: `Hello ${user?.name || 'there'}! I'm your SIYP AI Mentor. I can help you find the best opportunities and prepare your applications. What are you looking for today?`
            }
          ]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch chat history', err);
    }
  };

  const generateRecommendations = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/ai/recommendations/generate', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', content: data.raw_recommendation }]);
      } else {
        const errData = await res.json();
        setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', content: `**Notice:** ${errData.detail}` }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', content: "I'm sorry, I encountered an error connecting to my servers." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;
    setInputValue('');
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', content: userText }]);
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ message: userText })
      });
      
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: data.reply }]);
      } else {
        const errData = await res.json();
        setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: `*Error:* ${errData.detail}` }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: "I'm sorry, my servers are currently unreachable." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-[#F8F7F4] min-h-screen flex flex-col items-center justify-center">
        <Navbar />
        <p className="text-gray-500 mt-20">Please log in to use the AI Mentor.</p>
      </div>
    );
  }

  }

  return (
    <div className="bg-[#F8F7F4] min-h-screen flex flex-col">
      <Navbar />
      
      <main className="container-max pt-24 pb-8 flex-grow flex flex-col h-[calc(100vh-20px)]">
        <div className="flex-1 w-full max-w-5xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col animate-fade-in-up">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1B5442] to-[#143d30] p-6 text-white flex justify-between items-center shrink-0 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 animate-spin-slow"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-yellow-300/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>
            
            <div className="flex items-center gap-4 relative z-10">
              <Link to="/dashboard" className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm mr-2">
                <ArrowLeft size={20} />
              </Link>
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md shadow-inner border border-white/10">
                <Bot size={28} className="text-yellow-300" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-wide font-['Plus_Jakarta_Sans'] flex items-center gap-2">
                  SIYP AI Mentor <Sparkles size={18} className="text-yellow-300 animate-pulse" />
                </h1>
                <p className="text-sm text-green-100 flex items-center gap-1.5 opacity-90">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> 
                  Your personalized career and academic guide
                </p>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-6 custom-scrollbar" style={{ backgroundColor: '#faf9f6' }}>
            {messages.length === 1 && messages[0].id === 'welcome' && (
              <div className="flex justify-center mb-6 mt-4">
                <button 
                  onClick={generateRecommendations}
                  disabled={isLoading}
                  className="group relative overflow-hidden bg-white hover:bg-gray-50 text-[#1B5442] text-sm font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl border border-[#1B5442]/10 transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-3"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#1B5442]/0 via-[#1B5442]/5 to-[#1B5442]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  <Sparkles size={18} className="text-yellow-500" /> 
                  Auto-Generate My Top Matches
                </button>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
                style={{ animationFillMode: 'both' }}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1B5442] to-[#143d30] flex items-center justify-center shrink-0 mr-3 mt-1 shadow-md">
                    <Bot size={16} className="text-white" />
                  </div>
                )}
                
                <div 
                  className={`max-w-[95%] md:max-w-[85%] rounded-3xl p-5 shadow-sm text-[15px] ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-br from-[#1B5442] to-[#143d30] text-white rounded-tr-sm shadow-md' 
                      : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-lg'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm md:prose-base max-w-none text-gray-700">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={MarkdownComponents}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start animate-fade-in-up mt-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1B5442] to-[#143d30] flex items-center justify-center shrink-0 mr-3 mt-1 shadow-md">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="bg-white border border-gray-100 rounded-3xl rounded-tl-sm p-5 shadow-lg flex items-center gap-3 h-14">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 bg-[#1B5442]/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2.5 h-2.5 bg-[#1B5442]/70 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2.5 h-2.5 bg-[#1B5442] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>

          {/* Input Area */}
          <div className="p-4 md:p-6 bg-white border-t border-gray-100 shrink-0 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.05)] z-10">
            <form onSubmit={handleSend} className="relative flex items-center max-w-4xl mx-auto">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask your mentor about specific opportunities, career paths, or advice..."
                className="w-full bg-[#F8F7F4] border border-gray-200 text-base rounded-full py-4 pl-6 pr-16 focus:outline-none focus:border-[#1B5442] focus:ring-4 focus:ring-[#1B5442]/10 transition-all shadow-inner"
                disabled={isLoading}
              />
              <button 
                type="submit" 
                disabled={!inputValue.trim() || isLoading}
                className={`absolute right-2 p-3.5 rounded-full transition-all duration-300 shadow-md ${inputValue.trim() ? 'bg-[#1B5442] hover:bg-[#143d30] text-white hover:shadow-lg transform hover:-translate-y-0.5' : 'bg-gray-200 text-gray-400'}`}
              >
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className={inputValue.trim() ? 'translate-x-0.5' : ''} />}
              </button>
            </form>
            <div className="text-center mt-3">
              <span className="text-xs text-gray-400 font-medium">AI recommendations can make mistakes. Always verify deadlines on the official opportunity page.</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AIMentorPage;
