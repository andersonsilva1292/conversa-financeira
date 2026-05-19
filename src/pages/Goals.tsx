import { motion } from "framer-motion";
import { Target, Plus, TrendingUp, CheckCircle2, Pencil, Trash2 } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type Goal = {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  icon: string | null;
  color: string | null;
};

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const Goals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [form, setForm] = useState({ title: "", target_amount: "", current_amount: "0", deadline: "", icon: "🎯" });

  const fetchGoals = async () => {
    if (!user) return;
    const { data } = await supabase.from("goals").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setGoals(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchGoals(); }, [user]);

  const totalSaved = goals.reduce((a, g) => a + g.current_amount, 0);
  const totalTarget = goals.reduce((a, g) => a + g.target_amount, 0);
  const completed = goals.filter(g => g.current_amount >= g.target_amount).length;

  const handleSave = async () => {
    if (!user || !form.title || !form.target_amount) return;
    const payload = {
      title: form.title,
      target_amount: parseFloat(form.target_amount),
      current_amount: parseFloat(form.current_amount) || 0,
      deadline: form.deadline || null,
      icon: form.icon,
    };

    if (editingGoal) {
      const { error } = await supabase.from("goals").update(payload).eq("id", editingGoal.id);
      if (error) toast.error(error.message); else toast.success("Meta atualizada!");
    } else {
      const { error } = await supabase.from("goals").insert({ ...payload, user_id: user.id });
      if (error) toast.error(error.message); else toast.success("Meta criada!");
    }
    setShowForm(false);
    setEditingGoal(null);
    setForm({ title: "", target_amount: "", current_amount: "0", deadline: "", icon: "🎯" });
    fetchGoals();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("goals").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Meta excluída!"); fetchGoals(); }
  };

  const openEdit = (g: Goal) => {
    setEditingGoal(g);
    setForm({ title: g.title, target_amount: String(g.target_amount), current_amount: String(g.current_amount), deadline: g.deadline || "", icon: g.icon || "🎯" });
    setShowForm(true);
  };

  return (
    <AppLayout>
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-5xl space-y-8">
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-display text-foreground flex items-center gap-3">
              <Target className="w-8 h-8 text-primary" />
              Metas Financeiras
            </h1>
            <p className="text-muted-foreground mt-1">Acompanhe seu progresso e conquiste seus objetivos</p>
          </div>
          <Dialog open={showForm} onOpenChange={(open) => { setShowForm(open); if (!open) { setEditingGoal(null); setForm({ title: "", target_amount: "", current_amount: "0", deadline: "", icon: "🎯" }); } }}>
            <DialogTrigger asChild>
              <Button className="gradient-bg text-primary-foreground font-semibold gap-2 hover:opacity-90">
                <Plus className="w-4 h-4" />
                Nova Meta
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="font-display">{editingGoal ? "Editar Meta" : "Nova Meta"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Título da meta" className="w-full bg-secondary text-foreground placeholder:text-muted-foreground px-4 py-3 rounded-lg text-sm outline-none border border-border focus:border-primary/50" />
                <input type="number" step="0.01" value={form.target_amount} onChange={e => setForm(f => ({ ...f, target_amount: e.target.value }))} placeholder="Valor objetivo (R$)" className="w-full bg-secondary text-foreground placeholder:text-muted-foreground px-4 py-3 rounded-lg text-sm outline-none border border-border focus:border-primary/50" />
                <input type="number" step="0.01" value={form.current_amount} onChange={e => setForm(f => ({ ...f, current_amount: e.target.value }))} placeholder="Valor atual (R$)" className="w-full bg-secondary text-foreground placeholder:text-muted-foreground px-4 py-3 rounded-lg text-sm outline-none border border-border focus:border-primary/50" />
                <input value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} placeholder="Prazo (ex: Jun 2026)" className="w-full bg-secondary text-foreground placeholder:text-muted-foreground px-4 py-3 rounded-lg text-sm outline-none border border-border focus:border-primary/50" />
                <Button onClick={handleSave} className="w-full gradient-bg text-primary-foreground font-semibold">
                  {editingGoal ? "Salvar Alterações" : "Criar Meta"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {goals.length > 0 && (
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
        )}

        {goals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {goals.map((goal) => {
              const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
              const isComplete = progress >= 100;
              return (
                <motion.div key={goal.id} variants={itemVariants} className={`glass-card p-5 group ${isComplete ? "glow-border" : ""}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{goal.icon}</span>
                      <div>
                        <h3 className="font-display font-semibold text-foreground">{goal.title}</h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          {isComplete ? <><CheckCircle2 className="w-3 h-3 text-primary" /> Concluída!</> : <><TrendingUp className="w-3 h-3" /> Prazo: {goal.deadline || "Sem prazo"}</>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">{Math.round(progress)}%</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(goal)} aria-label="Editar meta" className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(goal.id)} aria-label="Excluir meta" className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-secondary mb-3 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1, ease: "easeOut" }} className="h-full rounded-full" style={{ backgroundColor: goal.color || "hsl(152, 69%, 53%)" }} />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>R$ {goal.current_amount.toLocaleString("pt-BR")}</span>
                    <span>R$ {goal.target_amount.toLocaleString("pt-BR")}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : !loading ? (
          <motion.div variants={itemVariants} className="glass-card p-10 text-center">
            <Target className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="font-display font-semibold text-foreground text-lg mb-2">Nenhuma meta ainda</h2>
            <p className="text-muted-foreground text-sm">Clique em "Nova Meta" para criar seu primeiro objetivo financeiro.</p>
          </motion.div>
        ) : null}
      </motion.div>
    </AppLayout>
  );
};

export default Goals;
