import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, TrendingUp, Wallet, CreditCard, PiggyBank, Plus, Pencil, Trash2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const categoryIcons: Record<string, string> = {
  "Alimentação": "🛒", "Transporte": "🚗", "Entretenimento": "🎬",
  "Saúde": "💊", "Educação": "📚", "Moradia": "🏠", "Renda": "💰", "Outros": "📦",
};

const categoryColors: Record<string, string> = {
  "Alimentação": "hsl(152, 69%, 53%)", "Transporte": "hsl(199, 89%, 48%)",
  "Entretenimento": "hsl(45, 93%, 58%)", "Saúde": "hsl(280, 65%, 60%)",
  "Educação": "hsl(200, 70%, 60%)", "Moradia": "hsl(30, 80%, 55%)",
  "Renda": "hsl(120, 60%, 50%)", "Outros": "hsl(0, 72%, 51%)",
};

type Transaction = {
  id: string;
  description: string;
  category: string;
  amount: number;
  transaction_date: string;
  icon: string | null;
};

const StatCard = ({ icon: Icon, label, value, negative }: { icon: any; label: string; value: string; negative?: boolean }) => (
  <motion.div variants={itemVariants} className="glass-card p-5 flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${negative ? "bg-destructive/10" : "bg-primary/10"}`}>
        <Icon className={`w-5 h-5 ${negative ? "text-destructive" : "text-primary"}`} />
      </div>
    </div>
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold font-display ${negative ? "text-destructive" : "text-foreground"}`}>{value}</p>
    </div>
  </motion.div>
);

const Index = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [form, setForm] = useState({ description: "", amount: "", category: "Outros", transaction_date: new Date().toISOString().split("T")[0] });

  const fetchTransactions = async () => {
    if (!user) return;
    const { data } = await supabase.from("transactions").select("*").eq("user_id", user.id).order("transaction_date", { ascending: false });
    setTransactions(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchTransactions(); }, [user]);

  // Saldo Total = soma das rendas (salário, investimentos positivos)
  const saldoTotal = transactions.filter(t => t.amount > 0).reduce((a, t) => a + t.amount, 0);
  // Despesas = soma dos gastos (valores negativos)
  const despesas = transactions.filter(t => t.amount < 0).reduce((a, t) => a + Math.abs(t.amount), 0);
  // Receitas = Saldo Total - Despesas (o que sobra)
  const receitas = saldoTotal - despesas;

  const categoryData = Object.entries(
    transactions.filter(t => t.amount < 0).reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value, color: categoryColors[name] || "hsl(0, 0%, 50%)" }));

  // Weekly data from last 7 days
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const today = new Date();
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split("T")[0];
    const gasto = transactions
      .filter(t => t.transaction_date === dateStr && t.amount < 0)
      .reduce((a, t) => a + Math.abs(t.amount), 0);
    return { day: weekDays[d.getDay()], gasto };
  });

  const handleSave = async () => {
    if (!user || !form.description || !form.amount) return;
    let amount = parseFloat(form.amount);
    if (isNaN(amount)) return;
    // Despesas (não-Renda) devem ser negativas
    if (form.category !== "Renda" && amount > 0) amount = -amount;

    if (editingTx) {
      const { error } = await supabase.from("transactions").update({
        description: form.description,
        amount,
        category: form.category,
        transaction_date: form.transaction_date,
        icon: categoryIcons[form.category] || "💰",
      }).eq("id", editingTx.id);
      if (error) toast.error(error.message);
      else toast.success("Transação atualizada!");
    } else {
      const { error } = await supabase.from("transactions").insert({
        user_id: user.id,
        description: form.description,
        amount,
        category: form.category,
        transaction_date: form.transaction_date,
        icon: categoryIcons[form.category] || "💰",
      });
      if (error) toast.error(error.message);
      else toast.success("Transação adicionada!");
    }
    setShowForm(false);
    setEditingTx(null);
    setForm({ description: "", amount: "", category: "Outros", transaction_date: new Date().toISOString().split("T")[0] });
    fetchTransactions();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Transação excluída!"); fetchTransactions(); }
  };

  const openEdit = (t: Transaction) => {
    setEditingTx(t);
    setForm({ description: t.description, amount: String(t.amount), category: t.category, transaction_date: t.transaction_date });
    setShowForm(true);
  };

  const fmt = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  return (
    <AppLayout>
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 max-w-7xl">
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">FinançaIA</p>
            <h1 className="text-3xl font-bold font-display text-foreground">{(() => {
              const now = new Date();
              const brasiliaHour = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })).getHours();
              if (brasiliaHour >= 5 && brasiliaHour < 12) return "Bom dia! 👋";
              if (brasiliaHour >= 12 && brasiliaHour < 18) return "Boa tarde! 👋";
              return "Boa noite! 👋";
            })()}</h1>
            <p className="text-muted-foreground mt-1">
              {transactions.length === 0 ? "Comece registrando sua primeira transação" : "Aqui está o resumo das suas finanças"}
            </p>
          </div>
          <Dialog open={showForm} onOpenChange={(open) => { setShowForm(open); if (!open) { setEditingTx(null); setForm({ description: "", amount: "", category: "Outros", transaction_date: new Date().toISOString().split("T")[0] }); } }}>
            <DialogTrigger asChild>
              <Button className="gradient-bg text-primary-foreground font-semibold gap-2 hover:opacity-90 transition-opacity">
                <Plus className="w-4 h-4" />
                Nova Transação
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="font-display">{editingTx ? "Editar Transação" : "Nova Transação"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Descrição" className="w-full bg-secondary text-foreground placeholder:text-muted-foreground px-4 py-3 rounded-lg text-sm outline-none border border-border focus:border-primary/50" />
                <input type="number" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="Valor: Positivo +1 ou Negativo -1" className="w-full bg-secondary text-foreground placeholder:text-muted-foreground px-4 py-3 rounded-lg text-sm outline-none border border-border focus:border-primary/50" />
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full bg-secondary text-foreground px-4 py-3 rounded-lg text-sm outline-none border border-border focus:border-primary/50">
                  {Object.keys(categoryIcons).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input type="date" value={form.transaction_date} onChange={e => setForm(f => ({ ...f, transaction_date: e.target.value }))} className="w-full bg-secondary text-foreground px-4 py-3 rounded-lg text-sm outline-none border border-border focus:border-primary/50" />
                <Button onClick={handleSave} className="w-full gradient-bg text-primary-foreground font-semibold">
                  {editingTx ? "Salvar Alterações" : "Adicionar"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StatCard icon={Wallet} label="Saldo Total" value={fmt(saldoTotal)} negative={receitas < 0} />
          <StatCard icon={TrendingUp} label="Receitas" value={fmt(receitas)} negative={receitas < 0} />
          <StatCard icon={CreditCard} label="Despesas" value={fmt(despesas)} />
        </div>

        {transactions.length > 0 && (
          <>
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <motion.div variants={itemVariants} className="glass-card p-5 lg:col-span-2">
                <h3 className="font-display font-semibold text-foreground mb-4">Gastos da Semana</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={weeklyData}>
                    <defs>
                      <linearGradient id="colorGasto" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(152, 69%, 53%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(152, 69%, 53%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 12 }} tickFormatter={(v) => `R$${v}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(220, 18%, 12%)", border: "1px solid hsl(220, 14%, 18%)", borderRadius: "8px", color: "hsl(0, 0%, 95%)" }}
                      formatter={(value: number) => [`R$ ${value.toFixed(2)}`, "Gasto"]}
                    />
                    <Area type="monotone" dataKey="gasto" stroke="hsl(152, 69%, 53%)" strokeWidth={2} fill="url(#colorGasto)" />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>

              {categoryData.length > 0 && (
                <motion.div variants={itemVariants} className="glass-card p-5">
                  <h3 className="font-display font-semibold text-foreground mb-4">Por Categoria</h3>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                        {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-2">
                    {categoryData.map((cat, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                          <span className="text-muted-foreground">{cat.name}</span>
                        </div>
                        <span className="text-foreground font-medium">{fmt(cat.value)}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Recent Transactions */}
            <motion.div variants={itemVariants} className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-foreground">Transações Recentes</h3>
              </div>
              <div className="space-y-2">
                {transactions.slice(0, 10).map((t) => (
                  <motion.div key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors group">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-lg">
                      {t.icon || categoryIcons[t.category] || "💰"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{t.description}</p>
                      <p className="text-xs text-muted-foreground">{t.category} · {new Date(t.transaction_date + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</p>
                    </div>
                    <p className={`text-sm font-semibold ${t.amount > 0 ? "text-primary" : "text-foreground"}`}>
                      {t.amount > 0 ? "+" : ""}R$ {Math.abs(t.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(t)} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" aria-label="Editar">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" aria-label="Excluir">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        )}

        {transactions.length === 0 && !loading && (
          <motion.div variants={itemVariants} className="glass-card p-10 text-center">
            <PiggyBank className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="font-display font-semibold text-foreground text-lg mb-2">Nenhuma transação ainda</h3>
            <p className="text-muted-foreground text-sm mb-4">Clique em "Nova Transação" ou use o Chat IA para registrar seus gastos e receitas.</p>
          </motion.div>
        )}
      </motion.div>
    </AppLayout>
  );
};

export default Index;
