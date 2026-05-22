import { motion } from "framer-motion";
import { BarChart3, Calendar, CreditCard } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import AppLayout from "@/components/AppLayout";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const tooltipStyle = {
  backgroundColor: "hsl(220, 18%, 12%)",
  border: "1px solid hsl(220, 14%, 18%)",
  borderRadius: "8px",
  color: "hsl(0, 0%, 95%)",
};

const categoryColors: Record<string, string> = {
  "Alimentação": "hsl(152, 69%, 53%)", "Transporte": "hsl(199, 89%, 48%)",
  "Entretenimento": "hsl(45, 93%, 58%)", "Saúde": "hsl(280, 65%, 60%)",
  "Educação": "hsl(200, 70%, 60%)", "Moradia": "hsl(30, 80%, 55%)",
  "Renda": "hsl(120, 60%, 50%)", "Outros": "hsl(0, 72%, 51%)",
};

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const Reports = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [cardTx, setCardTx] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("transactions").select("*").eq("user_id", user.id).order("transaction_date", { ascending: true })
      .then(({ data }) => setTransactions(data || []));
    supabase.from("card_transactions").select("*").eq("user_id", user.id).order("transaction_date", { ascending: false })
      .then(({ data }) => setCardTx(data || []));
  }, [user]);

  const cardTotal = cardTx.reduce((a, i) => a + Number(i.amount), 0);
  const cardByPerson = useMemo(() => {
    const m: Record<string, number> = {};
    cardTx.forEach(i => { m[i.person_name] = (m[i.person_name] || 0) + Number(i.amount); });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [cardTx]);

  const monthlyData = useMemo(() => {
    const months: Record<string, { receita: number; despesa: number }> = {};
    transactions.forEach(t => {
      const m = new Date(t.transaction_date + "T12:00:00").toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
      if (!months[m]) months[m] = { receita: 0, despesa: 0 };
      if (t.amount > 0) months[m].receita += t.amount;
      else months[m].despesa += Math.abs(t.amount);
    });
    return Object.entries(months).map(([month, d]) => ({ month, ...d }));
  }, [transactions]);

  const trendData = useMemo(() => {
    let saldo = 0;
    const months: Record<string, number> = {};
    transactions.forEach(t => {
      const m = new Date(t.transaction_date + "T12:00:00").toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
      saldo += t.amount;
      months[m] = saldo;
    });
    return Object.entries(months).map(([month, saldo]) => ({ month, saldo }));
  }, [transactions]);

  const categoryBreakdown = useMemo(() => {
    const cats: Record<string, number> = {};
    transactions.filter(t => t.amount < 0).forEach(t => {
      cats[t.category] = (cats[t.category] || 0) + Math.abs(t.amount);
    });
    return Object.entries(cats).map(([name, value]) => ({ name, value, color: categoryColors[name] || "hsl(0,0%,50%)" }));
  }, [transactions]);

  const hasData = transactions.length > 0;

  return (
    <AppLayout>
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-6xl space-y-8">
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-display text-foreground flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-primary" />
              Relatórios
            </h1>
            <p className="text-muted-foreground mt-1">Visualize seus dados financeiros em detalhes</p>
          </div>
        </motion.div>

        {!hasData ? (
          <motion.div variants={itemVariants} className="glass-card p-10 text-center">
            <BarChart3 className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="font-display font-semibold text-foreground text-lg mb-2">Sem dados ainda</h2>
            <p className="text-muted-foreground text-sm">Registre transações para ver relatórios detalhados aqui.</p>
          </motion.div>
        ) : (
          <>
            <motion.div variants={itemVariants} className="glass-card p-6">
              <h2 className="font-display font-semibold text-foreground mb-6">Receitas vs Despesas</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData} barGap={4}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 12 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(1)}k`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR")}`} />
                  <Bar dataKey="receita" name="Receita" fill="hsl(152, 69%, 53%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="despesa" name="Despesa" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} opacity={0.7} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <motion.div variants={itemVariants} className="glass-card p-6">
                <h2 className="font-display font-semibold text-foreground mb-6">Evolução do Saldo</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={trendData}>
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 12 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(1)}k`} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR")}`} />
                    <Line type="monotone" dataKey="saldo" stroke="hsl(152, 69%, 53%)" strokeWidth={2.5} dot={{ fill: "hsl(152, 69%, 53%)", r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>

              {categoryBreakdown.length > 0 && (
                <motion.div variants={itemVariants} className="glass-card p-6">
                  <h2 className="font-display font-semibold text-foreground mb-6">Despesas por Categoria</h2>
                  <div className="flex items-center gap-6">
                    <ResponsiveContainer width="50%" height={200}>
                      <PieChart>
                        <Pie data={categoryBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                          {categoryBreakdown.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-3 flex-1">
                      {categoryBreakdown.map((cat, i) => {
                        const total = categoryBreakdown.reduce((a, c) => a + c.value, 0);
                        return (
                          <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                              <span className="text-xs text-muted-foreground">{cat.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-foreground font-medium">R$ {cat.value.toLocaleString("pt-BR")}</span>
                              <span className="text-xs text-muted-foreground w-8 text-right">{((cat.value / total) * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </>
        )}

        {cardTx.length > 0 && (
          <motion.div variants={itemVariants} className="glass-card p-6">
            <h2 className="font-display font-semibold text-foreground mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Cartão de Crédito
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total da Fatura</p>
                <p className="text-2xl font-bold font-display text-foreground">
                  R$ {cardTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Por Pessoa</p>
                <div className="space-y-2">
                  {cardByPerson.map(([name, value]) => (
                    <div key={name} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{name}</span>
                      <span className="text-foreground font-semibold">
                        R$ {value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AppLayout>
  );
};

export default Reports;
