import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

const suggestions = [
  "Registrar gasto com supermercado R$250",
  "Quanto gastei este mês?",
  "Dicas para economizar",
  "Criar meta de economia",
];

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content: "Olá! 👋 Sou seu assistente financeiro. Posso ajudar você a registrar gastos, acompanhar metas e dar dicas para economizar. Como posso te ajudar hoje?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;

    const userMsg: Message = { id: Date.now(), role: "user", content: msg, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      let response = "Entendido! Vou processar sua solicitação.";

      if (msg.toLowerCase().includes("gasto") || msg.toLowerCase().includes("registrar")) {
        response = "✅ Gasto registrado com sucesso!\n\n**Detalhes:**\n- 🛒 Categoria: Alimentação\n- 💰 Valor: R$ 250,00\n- 📅 Data: Hoje\n\nSeu saldo atualizado é **R$ 4.600,00**. Quer registrar mais algum gasto?";
      } else if (msg.toLowerCase().includes("gastei") || msg.toLowerCase().includes("quanto")) {
        response = "📊 **Resumo do mês (Fevereiro):**\n\n- Alimentação: R$ 680,00\n- Transporte: R$ 220,00\n- Entretenimento: R$ 180,00\n- Saúde: R$ 150,00\n- Outros: R$ 120,00\n\n**Total: R$ 1.350,00**\n\nVocê está 15% abaixo do mês passado! Continue assim! 💪";
      } else if (msg.toLowerCase().includes("dica") || msg.toLowerCase().includes("economizar")) {
        response = "💡 **Dicas personalizadas para você:**\n\n1. **Alimentação** — Planeje compras semanais e evite compras por impulso. Economia estimada: R$ 120/mês\n2. **Transporte** — Considere usar transporte público 2x por semana. Economia: R$ 80/mês\n3. **Entretenimento** — Revise assinaturas de streaming não utilizadas. Economia: R$ 55/mês\n\n🎯 **Potencial de economia: R$ 255/mês**";
      } else if (msg.toLowerCase().includes("meta")) {
        response = "🎯 Vamos criar uma meta!\n\nMe diga:\n1. **Qual o objetivo?** (ex: viagem, reserva de emergência)\n2. **Valor desejado?**\n3. **Em quanto tempo?**\n\nAssim posso calcular quanto você precisa guardar por mês! 📈";
      }

      setMessages((prev) => [...prev, { id: Date.now(), role: "assistant", content: response, timestamp: new Date() }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto h-[calc(100vh-4rem)] flex flex-col">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display text-foreground">Chat Financeiro</h1>
            <p className="text-sm text-muted-foreground">Converse naturalmente sobre suas finanças</p>
          </div>
        </motion.div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pb-4 pr-2 scrollbar-thin">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  msg.role === "assistant" ? "bg-primary/10" : "bg-secondary"
                }`}>
                  {msg.role === "assistant" ? (
                    <Bot className="w-4 h-4 text-primary" />
                  ) : (
                    <User className="w-4 h-4 text-secondary-foreground" />
                  )}
                </div>
                <div className={`max-w-[75%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "assistant"
                    ? "glass-card text-foreground"
                    : "gradient-bg text-primary-foreground"
                }`}>
                  {msg.content.split("\n").map((line, i) => (
                    <p key={i} className={i > 0 ? "mt-1" : ""}>
                      {line.replace(/\*\*(.*?)\*\*/g, "").includes("**") ? line : line.replace(/\*\*(.*?)\*\*/g, (_, t) => t)}
                    </p>
                  ))}
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

        {/* Suggestions */}
        {messages.length <= 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap gap-2 mb-4">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => handleSend(s)}
                className="text-xs px-3 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all"
              >
                {s}
              </button>
            ))}
          </motion.div>
        )}

        {/* Input */}
        <div className="glass-card p-3 flex items-center gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Digite sua mensagem..."
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-sm outline-none"
            aria-label="Mensagem para o assistente financeiro"
          />
          <Button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            size="icon"
            className="gradient-bg text-primary-foreground hover:opacity-90 disabled:opacity-40"
            aria-label="Enviar mensagem"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Chat;
