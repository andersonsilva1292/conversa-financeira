import { motion } from "framer-motion";
import { BarChart3, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import AppLayout from "@/components/AppLayout";
import { useState } from "react";

const monthlyData = [
  { month: "Set", receita: 5800, despesa: 3200 },
  { month: "Out", receita: 6100, despesa: 3800 },
  { month: "Nov", receita: 5900, despesa: 2900 },
  { month: "Dez", receita: 7200, despesa: 4500 },
  { month: "Jan", receita: 6000, despesa: 3100 },
  { month: "Fev", receita: 6200, despesa: 1350 },
];

const trendData = [
  { month: "Set", saldo: 2600 },
  { month: "Out", saldo: 2300 },
  { month: "Nov", saldo: 3000 },
  { month: "Dez", saldo: 2700 },
  { month: "Jan", saldo: 2900 },
  { month: "Fev", saldo: 4850 },
];

const categoryBreakdown = [
  { name: "Alimentação", value: 680, color: "hsl(152, 69%, 53%)" },
  { name: "Moradia", value: 1200, color: "hsl(199, 89%, 48%)" },
  { name: "Transporte", value: 220, color: "hsl(45, 93%, 58%)" },
  { name: "Lazer", value: 180, color: "hsl(280, 65%, 60%)" },
  { name: "Saúde", value: 150, color: "hsl(0, 72%, 51%)" },
  { name: "Educação", value: 300, color: "hsl(200, 70%, 60%)" },
];

const tooltipStyle = {
  backgroundColor: "hsl(220, 18%, 12%)",
  border: "1px solid hsl(220, 14%, 18%)",
  borderRadius: "8px",
  color: "hsl(0, 0%, 95%)",
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const Reports = () => {
  const [period] = useState("6 meses");

  return (
    <AppLayout>
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-6xl space-y-8">
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-display text-foreground flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-primary" />
              Relatórios
            </h1>
            <p className="text-muted-foreground mt-1">Visualize seus dados financeiros em detalhes</p>
          </div>
          <div className="glass-card px-4 py-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            Últimos {period}
          </div>
        </motion.div>

        {/* Receitas vs Despesas */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <h3 className="font-display font-semibold text-foreground mb-6">Receitas vs Despesas</h3>
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
          {/* Saldo Trend */}
          <motion.div variants={itemVariants} className="glass-card p-6">
            <h3 className="font-display font-semibold text-foreground mb-6">Evolução do Saldo</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <defs>
                  <linearGradient id="saldoGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(152, 69%, 53%)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(152, 69%, 53%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 12 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(1)}k`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR")}`} />
                <Line type="monotone" dataKey="saldo" stroke="hsl(152, 69%, 53%)" strokeWidth={2.5} dot={{ fill: "hsl(152, 69%, 53%)", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Category Full Breakdown */}
          <motion.div variants={itemVariants} className="glass-card p-6">
            <h3 className="font-display font-semibold text-foreground mb-6">Despesas por Categoria</h3>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie data={categoryBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {categoryBreakdown.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3 flex-1">
                {categoryBreakdown.map((cat, i) => {
                  const total = categoryBreakdown.reduce((a, c) => a + c.value, 0);
                  const pct = ((cat.value / total) * 100).toFixed(0);
                  return (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="text-xs text-muted-foreground">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-foreground font-medium">R$ {cat.value}</span>
                        <span className="text-xs text-muted-foreground w-8 text-right">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Previsão */}
        <motion.div variants={itemVariants} className="glass-card glow-border p-6">
          <h3 className="font-display font-semibold text-foreground mb-2">📈 Previsão para Março</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Com base no seu padrão de gastos, estimamos despesas de <span className="text-foreground font-medium">R$ 3.200</span> em março. 
            Mantendo sua receita atual, seu saldo projetado será de <span className="text-primary font-semibold">R$ 7.850</span>. 
            Você está no caminho certo para atingir sua meta de reserva de emergência até junho!
          </p>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
};

export default Reports;
