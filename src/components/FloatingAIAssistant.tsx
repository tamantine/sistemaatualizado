import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function FloatingAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! Sou o seu Assistente IA. Como posso ajudar com o sistema hoje?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Prepara o histórico no formato correto para a API
      const apiMessages = [...messages, newUserMsg].map(m => ({
        role: m.role,
        content: m.content
      }));

      // Chama o assistente e aguarda
      import('../services/llmAgentService').then(async ({ processChatWithAgent }) => {
        try {
          const resposta = await processChatWithAgent(apiMessages);
          
          const aiResponse: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: resposta,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, aiResponse]);
        } catch (error: any) {
          console.error("Erro na IA:", error);
          const errorMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `❌ Ocorreu um erro: ${error.message || "Falha na comunicação."}`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, errorMsg]);
        } finally {
          setIsLoading(false);
          scrollToBottom(); // Rola para a mensagem nova
        }
      });
    } catch (e) {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Botão Flutuante */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-full shadow-lg shadow-emerald-500/30 transition-all duration-300 flex items-center justify-center transform hover:scale-105"
        >
          <MessageCircle size={28} />
        </button>
      )}

      {/* Janela de Chat */}
      {isOpen && (
        <div className="bg-[#1e1e24] border border-[#333] rounded-2xl shadow-2xl w-[380px] h-[600px] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300 relative">
          
          {/* Header */}
          <div className="bg-[#2a2a35] p-4 flex items-center justify-between border-b border-[#333]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600/20 flex items-center justify-center">
                <Bot className="text-emerald-500" size={24} />
              </div>
              <div>
                <h3 className="text-white font-medium">Assistente Bom Preço</h3>
                <p className="text-emerald-400 text-xs flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  Online
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <X size={20} />
            </button>
          </div>

          {/* Area de Mensagens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#1a1a20]">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-[#2a2a35]'}`}>
                  {msg.role === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-emerald-500" />}
                </div>
                <div className={`p-3 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-sm' 
                    : 'bg-[#2a2a35] text-gray-200 border border-[#333] rounded-tl-sm'
                }`}>
                  {msg.content}
                  <div className={`text-[10px] mt-1 text-right ${msg.role === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-[#2a2a35] flex items-center justify-center shrink-0">
                  <Bot size={16} className="text-emerald-500" />
                </div>
                <div className="p-3 rounded-2xl bg-[#2a2a35] border border-[#333] rounded-tl-sm text-gray-200 flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-emerald-500" />
                  <span className="text-sm">Pensando...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-[#2a2a35] border-t border-[#333]">
            <div className="relative flex items-center">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Pergunte ou peça algo..."
                className="w-full bg-[#1a1a20] border border-[#444] text-white rounded-full py-3 pl-4 pr-12 focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-gray-500"
              />
              <button 
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="absolute right-2 text-emerald-500 p-2 hover:bg-emerald-500/10 rounded-full transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <Send size={20} />
              </button>
            </div>
            <div className="text-center mt-2">
                <span className="text-[10px] text-gray-500 flex items-center justify-center gap-1">
                    Powered by Bom Preço IA
                </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
