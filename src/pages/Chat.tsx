import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

const suggestions = [
  "Registrar gasto com supermercado R$250",
  "Quanto gastei este mês?",
  "Dicas para economizar",
  "Criar meta de economia",
];

const Chat = () => {
  const { session } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: "assistant", content: "Olá! 👋 Sou seu assistente financeiro. Posso ajudar você a registrar gastos, acompanhar metas e dar dicas para economizar. Como posso te ajudar hoje?" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isTyping) return;

    const userMsg: Message = { id: Date.now(), role: "user", content: msg };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          messages: newMessages.slice(1).map(m => ({ role: m.role, content: m.content })),
        },
      });

      const response = error ? "Desculpe, ocorreu um erro. Tente novamente." : (data?.message || "Desculpe, não consegui processar.");
      setMessages(prev => [...prev, { id: Date.now(), role: "assistant", content: response }]);
    } catch {
      setMessages(prev => [...prev, { id: Date.now(), role: "assistant", content: "Erro de conexão. Tente novamente." }]);
    }
    setIsTyping(false);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto h-[calc(100vh-4rem)] flex flex-col">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display text-foreground">Chat Financeiro</h1>
            <p className="text-sm text-muted-foreground">Converse naturalmente sobre suas finanças</p>
          </div>
        </motion.div>

        <div className="flex-1 overflow-y-auto space-y-4 pb-4 pr-2 scrollbar-thin">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${msg.role === "assistant" ? "bg-primary/10" : "bg-secondary"}`}>
                  {msg.role === "assistant" ? <Bot className="w-4 h-4 text-primary" /> : <User className="w-4 h-4 text-secondary-foreground" />}
                </div>
                <div className={`max-w-[75%] rounded-xl px-4 py-3 text-sm leading-relaxed ${msg.role === "assistant" ? "glass-card text-foreground" : "gradient-bg text-primary-foreground"}`}>
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm prose-invert max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="glass-card px-4 py-3 flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </motion.div>
          )}
          <div ref={endRef} />
        </div>

        {messages.length <= 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap gap-2 mb-4">
            {suggestions.map((s) => (
              <button key={s} onClick={() => handleSend(s)} className="text-xs px-3 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all">
                {s}
              </button>
            ))}
          </motion.div>
        )}

        <div className="glass-card p-3 flex items-center gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Digite sua mensagem..."
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-sm outline-none"
            aria-label="Mensagem para o assistente financeiro"
          />
          <Button onClick={() => handleSend()} disabled={!input.trim() || isTyping} size="icon" className="gradient-bg text-primary-foreground hover:opacity-90 disabled:opacity-40" aria-label="Enviar mensagem">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Chat;
