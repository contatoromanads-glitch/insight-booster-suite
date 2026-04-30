import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, MessageSquare } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

import { supabase } from '@/integrations/supabase/client';

interface Props {
  client: any; // Opcionalmente, pode importar a interface ClientConfig
}

export function ChatPanel({ client }: Props) {
  const clientName = client ? client.name : "Todos os Clientes";
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: `Olá! Sou seu assistente de campanhas para **${clientName}**. Posso gerar relatórios, ajustar orçamentos ou pausar campanhas. Como posso ajudar?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    setMessages([{
      id: '0',
      role: 'assistant',
      content: `Olá! Sou seu assistente de campanhas para **${clientName}**. Posso gerar relatórios, ajustar orçamentos ou pausar campanhas. Como posso ajudar?`,
      timestamp: new Date(),
    }]);
  }, [clientName]);

  const send = async () => {
    if (!input.trim()) return;
    
    const userContent = input;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: userContent, timestamp: new Date() };
    
    // Armazena a lista atualizada para enviar ao backend
    const currentMessages = [...messages, userMsg];
    setMessages(currentMessages);
    setInput('');

    // Prepara o histórico simplificado para enviar à API (apenas role e content)
    const history = currentMessages.map(m => ({
      role: m.role,
      content: m.content
    }));

    try {
      const { data, error } = await supabase.functions.invoke('chat-agent', {
        body: { 
          message: userContent,
          history: history,
          clientName: clientName,
          metaAdsId: client?.metaAdsId,
          metaBmToken: client?.metaBmToken,
          googleAdsId: client?.googleAdsId
        }
      });

      if (error) throw error;

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || "Desculpe, não consegui processar a resposta.",
        timestamp: new Date(),
      }]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ Erro de comunicação com a inteligência artificial. Verifique sua conexão. (${err.message})`,
        timestamp: new Date(),
      }]);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg animate-pulse-glow hover:scale-105 transition-transform z-50"
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-2rem)] h-[500px] glass-card flex flex-col z-50 shadow-2xl">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          <span className="text-sm font-semibold text-foreground">Assistente de Campanhas</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground text-lg">×</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5 text-primary" />
              </div>
            )}
            <div className={`max-w-[75%] text-xs leading-relaxed p-3 rounded-lg ${
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground rounded-br-sm'
                : 'bg-secondary text-secondary-foreground rounded-bl-sm'
            }`}>
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center shrink-0">
                <User className="w-3.5 h-3.5 text-accent-foreground" />
              </div>
            )}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="p-3 border-t border-border">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Ex: Me dê um relatório da última semana..."
            className="flex-1 text-xs bg-secondary border border-border rounded-lg px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={send}
            className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
