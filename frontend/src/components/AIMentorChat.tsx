import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, X, Loader2, Sparkles, ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../context/AuthContext';

interface Message {
  id: string | number;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const AIMentorChat: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && messages.length === 0 && user) {
      fetchHistory();
    }
  }, [isOpen, user]);

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
          // Default welcome message
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

  if (!user) return null; // Don't show to guests

  return (
    <>
      {/* Floating Action Button */}
      <div 
        className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ease-in-out ${isOpen ? 'opacity-0 pointer-events-none scale-75 translate-y-10' : 'opacity-100 scale-100 translate-y-0'}`}
      >
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-[#1B5442] rounded-full blur-xl opacity-40 animate-pulse-ring"></div>
        
        <button
          onClick={() => setIsOpen(true)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative bg-gradient-to-r from-[#1B5442] to-[#143d30] text-white p-4 rounded-full shadow-2xl hover:shadow-[#1B5442]/50 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center border border-white/20"
        >
          <Bot size={28} className={isHovered ? 'animate-bounce' : ''} />
          <Sparkles size={14} className="absolute top-2 right-2 text-yellow-300 animate-pulse" />
        </button>
      </div>

      {/* Chat Window */}
      <div 
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-[95vw] sm:w-[400px] h-[600px] max-h-[85vh] bg-white/90 backdrop-blur-xl border border-white shadow-2xl rounded-3xl z-50 flex flex-col overflow-hidden transition-all duration-500 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}
        style={{
          boxShadow: '0 25px 50px -12px rgba(27, 84, 66, 0.25)'
        }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1B5442] to-[#143d30] p-4 text-white flex justify-between items-center shrink-0 shadow-md relative overflow-hidden">
          {/* Animated Background shapes */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 animate-spin-slow"></div>
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide font-['Plus_Jakarta_Sans']">SIYP AI Mentor</h3>
              <p className="text-xs text-green-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> Online
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/20 rounded-full transition-colors relative z-10"
          >
            <ChevronDown size={20} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar bg-gradient-to-b from-gray-50/50 to-white">
          {messages.length === 1 && messages[0].id === 'welcome' && (
            <div className="flex justify-center mb-4">
              <button 
                onClick={generateRecommendations}
                disabled={isLoading}
                className="bg-[#1B5442]/10 hover:bg-[#1B5442]/20 text-[#1B5442] text-xs font-semibold py-2 px-4 rounded-full border border-[#1B5442]/20 transition-colors flex items-center gap-2"
              >
                <Sparkles size={14} /> Auto-Generate My Top Matches
              </button>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
            >
              <div 
                className={`max-w-[85%] rounded-2xl p-3.5 shadow-sm text-sm ${
                  msg.role === 'user' 
                    ? 'bg-[#1B5442] text-white rounded-br-sm' 
                    : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-a:text-[#1B5442] prose-a:font-semibold prose-a:no-underline hover:prose-a:underline prose-table:w-full prose-th:bg-gray-50 prose-th:p-2 prose-td:p-2 prose-td:border-t prose-td:border-gray-100">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
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
            <div className="flex justify-start animate-fade-in-up">
              <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm p-4 shadow-sm flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-[#1B5442]/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-[#1B5442]/70 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-[#1B5442] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-50 shrink-0">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about opportunities..."
              className="w-full bg-gray-50 border border-gray-200 text-sm rounded-full py-3 pl-4 pr-12 focus:outline-none focus:border-[#1B5442] focus:ring-2 focus:ring-[#1B5442]/20 transition-all"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={!inputValue.trim() || isLoading}
              className={`absolute right-1.5 p-2 rounded-full transition-all duration-300 ${inputValue.trim() ? 'bg-[#1B5442] text-white' : 'bg-transparent text-gray-400'}`}
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className={inputValue.trim() ? 'translate-x-0.5' : ''} />}
            </button>
          </form>
          <div className="text-center mt-2">
            <span className="text-[10px] text-gray-400 font-medium">Powered by SIYP AI Engine</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIMentorChat;
