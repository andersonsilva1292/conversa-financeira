import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, TrendingUp, Wallet, CreditCard, PiggyBank, Plus, Pencil, Trash2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const balanceData = { total: 4850.0, income: 6200.0, expenses: 1350.0 };

const recentTransactions = [
  { id: 1, description: "Supermercado Extra", category: "Alimentação", amount: -245.9, date: "15 Fev", icon: "🛒" },
  { id: 2, description: "Salário", category: "Renda", amount: 6200.0, date: "10 Fev", icon: "💰" },
  { id: 3, description: "Netflix", category: "Entretenimento", amount: -55.9, date: "08 Fev", icon: "🎬" },
  { id: 4, description: "Uber", category: "Transporte", amount: -32.5, date: "07 Fev", icon: "🚗" },
  { id: 5, description: "Farmácia", category: "Saúde", amount: -89.0, date: "05 Fev", icon: "💊" },
];

const categoryData = [
  { name: "Alimentação", value: 680, color: "hsl(152, 69%, 53%)" },
  { name: "Transporte", value: 220, color: "hsl(199, 89%, 48%)" },
  { name: "Entretenimento", value: 180, color: "hsl(45, 93%, 58%)" },
  { name: "Saúde", value: 150, color: "hsl(280, 65%, 60%)" },
  { name: "Outros", value: 120, color: "hsl(0, 72%, 51%)" },
];

const weeklyData = [
  { day: "Seg", gasto: 45 },
  { day: "Ter", gasto: 120 },
  { day: "Qua", gasto: 30 },
  { day: "Qui", gasto: 85 },
  { day: "Sex", gasto: 200 },
  { day: "Sáb", gasto: 150 },
  { day: "Dom", gasto: 60 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const StatCard = ({ icon: Icon, label, value, trend, positive }: { icon: any; label: string; value: string; trend: string; positive: boolean }) => (
  <motion.div variants={itemVariants} className="glass-card p-5 flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className={`flex items-center gap-1 text-xs font-medium ${positive ? "text-primary" : "text-destructive"}`}>
        {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {trend}
      </div>
    </div>
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold font-display text-foreground">{value}</p>
    </div>
  </motion.div>
);

const Index = () => {
  const [transactions, setTransactions] = useState(recentTransactions);

  const handleDelete = (id: number) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  return (
    <AppLayout>
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 max-w-7xl">
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-display text-foreground">Bom dia! 👋</h1>
            <p className="text-muted-foreground mt-1">Aqui está o resumo das suas finanças</p>
          </div>
          <Button className="gradient-bg text-primary-foreground font-semibold gap-2 hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" />
            Nova Transação
          </Button>
        </motion.div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StatCard icon={Wallet} label="Saldo Total" value={`R$ ${balanceData.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} trend="+12%" positive />
          <StatCard icon={TrendingUp} label="Receitas" value={`R$ ${balanceData.income.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} trend="+8%" positive />
          <StatCard icon={CreditCard} label="Despesas" value={`R$ ${balanceData.expenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} trend="-5%" positive={false} />
        </div>

        {/* Charts + Transactions Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Weekly Chart */}
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

          {/* Category Pie */}
          <motion.div variants={itemVariants} className="glass-card p-5">
            <h3 className="font-display font-semibold text-foreground mb-4">Por Categoria</h3>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
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
                  <span className="text-foreground font-medium">R$ {cat.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Recent Transactions */}
        <motion.div variants={itemVariants} className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-foreground">Transações Recentes</h3>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-primary/10">Ver todas</Button>
          </div>
          <div className="space-y-2">
            {transactions.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-lg">
                  {t.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{t.description}</p>
                  <p className="text-xs text-muted-foreground">{t.category} · {t.date}</p>
                </div>
                <p className={`text-sm font-semibold ${t.amount > 0 ? "text-primary" : "text-foreground"}`}>
                  {t.amount > 0 ? "+" : ""}R$ {Math.abs(t.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" aria-label="Editar">
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

        {/* Financial Tips */}
        <motion.div variants={itemVariants} className="glass-card glow-border p-5">
          <div className="flex items-center gap-3 mb-3">
            <PiggyBank className="w-5 h-5 text-primary" />
            <h3 className="font-display font-semibold text-foreground">Dica do Agente Financeiro</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            💡 Seus gastos com <span className="text-foreground font-medium">Alimentação</span> representam 50% das despesas. 
            Considere planejar compras semanais para economizar até <span className="text-primary font-semibold">R$ 120/mês</span>.
          </p>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
};

export default Index;
