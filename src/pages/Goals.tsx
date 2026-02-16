import { motion } from "framer-motion";
import { Target, Plus, TrendingUp, CheckCircle2 } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type Goal = {
  id: number;
  title: string;
  target: number;
  current: number;
  deadline: string;
  icon: string;
  color: string;
};

const initialGoals: Goal[] = [
  { id: 1, title: "Reserva de Emergência", target: 10000, current: 6500, deadline: "Jun 2026", icon: "🛡️", color: "hsl(152, 69%, 53%)" },
  { id: 2, title: "Viagem de Férias", target: 5000, current: 2300, deadline: "Dez 2026", icon: "✈️", color: "hsl(199, 89%, 48%)" },
  { id: 3, title: "Notebook Novo", target: 3500, current: 3500, deadline: "Concluída", icon: "💻", color: "hsl(45, 93%, 58%)" },
  { id: 4, title: "Curso de Inglês", target: 2400, current: 800, deadline: "Set 2026", icon: "📚", color: "hsl(280, 65%, 60%)" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const Goals = () => {
  const [goals] = useState(initialGoals);

  const totalSaved = goals.reduce((acc, g) => acc + g.current, 0);
  const totalTarget = goals.reduce((acc, g) => acc + g.target, 0);
  const completed = goals.filter((g) => g.current >= g.target).length;

  return (
    <AppLayout>
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-5xl space-y-8">
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-display text-foreground flex items-center gap-3">
              <Target className="w-8 h-8 text-primary" />
              Metas Financeiras
            </h1>
            <p className="text-muted-foreground mt-1">Acompanhe seu progresso e conquiste seus objetivos</p>
          </div>
          <Button className="gradient-bg text-primary-foreground font-semibold gap-2 hover:opacity-90">
            <Plus className="w-4 h-4" />
            Nova Meta
          </Button>
        </motion.div>

        {/* Summary */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="glass-card p-5 text-center">
            <p className="text-sm text-muted-foreground mb-1">Total Guardado</p>
            <p className="text-2xl font-bold font-display gradient-text">R$ {totalSaved.toLocaleString("pt-BR")}</p>
          </div>
          <div className="glass-card p-5 text-center">
            <p className="text-sm text-muted-foreground mb-1">Objetivo Total</p>
            <p className="text-2xl font-bold font-display text-foreground">R$ {totalTarget.toLocaleString("pt-BR")}</p>
          </div>
          <div className="glass-card p-5 text-center">
            <p className="text-sm text-muted-foreground mb-1">Metas Concluídas</p>
            <p className="text-2xl font-bold font-display text-foreground">{completed}/{goals.length}</p>
          </div>
        </motion.div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {goals.map((goal) => {
            const progress = Math.min((goal.current / goal.target) * 100, 100);
            const isComplete = progress >= 100;

            return (
              <motion.div key={goal.id} variants={itemVariants} className={`glass-card p-5 ${isComplete ? "glow-border" : ""}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{goal.icon}</span>
                    <div>
                      <h3 className="font-display font-semibold text-foreground">{goal.title}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        {isComplete ? (
                          <><CheckCircle2 className="w-3 h-3 text-primary" /> Concluída!</>
                        ) : (
                          <><TrendingUp className="w-3 h-3" /> Prazo: {goal.deadline}</>
                        )}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-foreground">{Math.round(progress)}%</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2.5 rounded-full bg-secondary mb-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: goal.color }}
                  />
                </div>

                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>R$ {goal.current.toLocaleString("pt-BR")}</span>
                  <span>R$ {goal.target.toLocaleString("pt-BR")}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </AppLayout>
  );
};

export default Goals;
