import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Loader2, Sparkles, ArrowLeft, Trash2 } from 'lucide-react';
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

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

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

  const generateRecommendations = async (targetPage: number = 0) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/ai/recommendations/generate?page=${targetPage}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', content: data.raw_recommendation }]);
        setHasMore(data.has_more);
        setPage(targetPage);
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

  const handleSend = async (e?: React.FormEvent, overrideText?: string, targetPage?: number) => {
    if (e) e.preventDefault();
    const userText = overrideText || inputValue.trim();
    if (!userText) return;

    setInputValue('');
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', content: userText }]);
    setIsLoading(true);

    const apiPage = targetPage !== undefined ? targetPage : page;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ message: userText, page: apiPage })
      });
      
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: data.reply }]);
        setHasMore(data.has_more);
        setPage(apiPage);
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

  const clearChat = async () => {
    if (!confirm("Are you sure you want to clear your chat history?")) return;
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/ai/chat/history', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `Hello ${user?.name || 'there'}! I'm your SIYP AI Mentor. I can help you find the best opportunities and prepare your applications. What are you looking for today?`
      }]);
      setPage(0);
      setHasMore(false);
    } catch (err) {
      console.error('Failed to clear chat', err);
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col font-['Inter',sans-serif]">
      <Navbar />

      {/* Main Chat Area (Native Scroll) */}
      <main className="flex-grow w-full max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-48 flex flex-col gap-6">
        {messages.length === 1 && messages[0].id === 'welcome' && (
          <div className="flex justify-center my-8">
            <button 
              onClick={() => generateRecommendations(0)}
              disabled={isLoading}
              className="group relative overflow-hidden bg-white text-[#1B5442] text-sm font-bold py-4 px-8 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgb(27,84,66,0.15)] border border-[#1B5442]/10 transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-3"
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
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1B5442] to-[#143d30] flex items-center justify-center shrink-0 mr-3 mt-1 shadow-sm hidden sm:flex">
                <Bot size={16} className="text-white" />
              </div>
            )}
            
            <div 
              className={`max-w-[95%] sm:max-w-[85%] rounded-3xl p-5 shadow-sm text-[15px] ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-br from-[#1B5442] to-[#143d30] text-white rounded-tr-sm' 
                  : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-md'
              }`}
            >
              {msg.role === 'assistant' ? (
                <div className="prose prose-sm sm:prose-base max-w-none text-gray-700">
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
          <div className="flex justify-start animate-fade-in-up">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1B5442] to-[#143d30] flex items-center justify-center shrink-0 mr-3 mt-1 shadow-sm hidden sm:flex">
              <Bot size={16} className="text-white" />
            </div>
            <div className="bg-white border border-gray-100 rounded-3xl rounded-tl-sm p-5 shadow-md flex items-center gap-3 h-14">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 bg-[#1B5442]/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2.5 h-2.5 bg-[#1B5442]/70 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2.5 h-2.5 bg-[#1B5442] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Fixed Bottom Input Area */}
      <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-gray-100 pt-3 pb-6 px-4 z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] flex flex-col items-center">
        
        {/* Suggested Prompts Pill */}
        {messages.length > 1 && !isLoading && hasMore && messages[messages.length - 1].role === 'assistant' && (
          <div className="max-w-4xl w-full flex gap-2 mb-3 overflow-x-auto pb-1 custom-scrollbar">
            <button 
              onClick={() => handleSend(undefined, "Show me more eligible opportunities", page + 1)}
              className="whitespace-nowrap px-4 py-2 bg-white border border-[#1B5442]/30 text-[#1B5442] text-xs font-semibold rounded-full shadow-sm hover:bg-[#1B5442]/5 hover:border-[#1B5442] transition-colors flex items-center gap-1.5"
            >
              Show me more eligible opportunities <Sparkles size={12} />
            </button>
          </div>
        )}

        <div className="max-w-4xl w-full flex items-center gap-3">
          <button 
            onClick={clearChat}
            title="Clear Chat History"
            className="p-4 rounded-full bg-gray-50 border border-gray-200 text-gray-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all shadow-sm shrink-0 flex items-center justify-center cursor-pointer"
          >
            <Trash2 size={20} />
          </button>
          
          <form onSubmit={(e) => handleSend(e)} className="relative flex items-center flex-grow">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask your mentor about opportunities..."
              className="w-full bg-[#F8F7F4] border border-gray-200 text-base rounded-full py-4 pl-6 pr-16 focus:outline-none focus:border-[#1B5442] focus:ring-4 focus:ring-[#1B5442]/10 transition-all shadow-inner"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={!inputValue.trim() || isLoading}
              className={`absolute right-2 p-3.5 rounded-full transition-all duration-300 shadow-sm ${inputValue.trim() ? 'bg-[#1B5442] hover:bg-[#143d30] text-white hover:shadow-md transform hover:-translate-y-0.5 cursor-pointer' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className={inputValue.trim() ? 'translate-x-0.5' : ''} />}
            </button>
          </form>
        </div>
        <div className="text-center mt-3 max-w-4xl mx-auto w-full">
          <span className="text-[11px] text-gray-400 font-medium">
            AI recommendations can make mistakes. Always verify deadlines on the official opportunity page. <br className="sm:hidden" />
            <span className="hidden sm:inline"> | </span> 
            To prevent system overload, opportunities are processed in batches. Use the "Show me more" button above to view the next batch.
          </span>
        </div>
      </div>
    </div>
  );
};

export default AIMentorPage;
