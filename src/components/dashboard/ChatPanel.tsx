import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, MessageSquare } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const MOCK_RESPONSES: Record<string, string> = {
  default: 'Entendido! No momento estou processando sua solicitação. Em breve terei uma resposta para você.',
  relatório: '📊 **Relatório resumido:**\n\nNos últimos 7 dias, suas campanhas geraram 5.420 conversões com um ROAS médio de 4.2x. O criativo "Treino Completo" foi o de melhor performance com CTR de 3.5%.',
  pausa: '⏸️ Entendido! A campanha foi marcada para pausa. A alteração será aplicada em até 15 minutos.',
  orçamento: '💰 Solicitação de aumento de orçamento registrada. O novo valor será aplicado a partir de amanhã.',
};

interface Props {
  clientName: string;
}

export function ChatPanel({ clientName }: Props) {
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

  const send = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    const text = input.toLowerCase();
    setInput('');

    setTimeout(() => {
      let response = MOCK_RESPONSES.default;
      if (text.includes('relatório') || text.includes('relatorio')) response = MOCK_RESPONSES.relatório;
      else if (text.includes('pausa') || text.includes('pausar')) response = MOCK_RESPONSES.pausa;
      else if (text.includes('orçamento') || text.includes('orcamento') || text.includes('budget')) response = MOCK_RESPONSES.orçamento;

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      }]);
    }, 800);
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
