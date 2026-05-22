import { motion } from "framer-motion";
import { CreditCard, Plus, Pencil, Trash2, Users } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type CardTx = {
  id: string;
  person_name: string;
  description: string;
  amount: number;
  transaction_date: string;
};

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const fmt = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

const CardTransactions = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<CardTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CardTx | null>(null);
  const [form, setForm] = useState({
    person_name: "",
    description: "",
    amount: "",
    transaction_date: new Date().toISOString().split("T")[0],
  });

  const fetchItems = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("card_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("transaction_date", { ascending: false });
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, [user]);

  const knownPeople = useMemo(
    () => Array.from(new Set(items.map(i => i.person_name).filter(Boolean))),
    [items]
  );

  const total = items.reduce((a, i) => a + Number(i.amount), 0);
  const byPerson = useMemo(() => {
    const m: Record<string, number> = {};
    items.forEach(i => { m[i.person_name] = (m[i.person_name] || 0) + Number(i.amount); });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [items]);

  const resetForm = () => {
    setEditing(null);
    setForm({ person_name: "", description: "", amount: "", transaction_date: new Date().toISOString().split("T")[0] });
  };

  const handleSave = async () => {
    if (!user) return;
    const person = form.person_name.trim();
    const desc = form.description.trim();
    const amount = parseFloat(form.amount);
    if (!person || !desc || isNaN(amount) || amount <= 0) {
      toast.error("Preencha pessoa, descrição e valor (positivo).");
      return;
    }
    if (person.length > 60 || desc.length > 120) {
      toast.error("Texto muito longo.");
      return;
    }
    if (editing) {
      const { error } = await supabase.from("card_transactions").update({
        person_name: person, description: desc, amount, transaction_date: form.transaction_date,
      }).eq("id", editing.id);
      if (error) return toast.error(error.message);
      toast.success("Lançamento atualizado!");
    } else {
      const { error } = await supabase.from("card_transactions").insert({
        user_id: user.id, person_name: person, description: desc, amount, transaction_date: form.transaction_date,
      });
      if (error) return toast.error(error.message);
      toast.success("Lançamento adicionado!");
    }
    setShowForm(false);
    resetForm();
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("card_transactions").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Lançamento excluído!");
    fetchItems();
  };

  const openEdit = (t: CardTx) => {
    setEditing(t);
    setForm({
      person_name: t.person_name,
      description: t.description,
      amount: String(t.amount),
      transaction_date: t.transaction_date,
    });
    setShowForm(true);
  };

  return (
    <AppLayout>
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 max-w-7xl">
        <motion.div variants={itemVariants} className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Finança IA</p>
            <h1 className="text-3xl font-bold font-display text-foreground flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-primary" />
              Cartão de Crédito
            </h1>
            <p className="text-muted-foreground mt-1">
              Registre os gastos do cartão e veja o total por pessoa que utilizou.
            </p>
          </div>
          <Dialog open={showForm} onOpenChange={(open) => { setShowForm(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gradient-bg text-primary-foreground font-semibold gap-2 hover:opacity-90 transition-opacity">
                <Plus className="w-4 h-4" />
                Novo Lançamento
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="font-display">
                  {editing ? "Editar Lançamento" : "Novo Lançamento de Cartão"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <input
                  list="known-people"
                  value={form.person_name}
                  onChange={e => setForm(f => ({ ...f, person_name: e.target.value }))}
                  placeholder="Pessoa que usou (ex: Eu, Maria)"
                  maxLength={60}
                  className="w-full bg-secondary text-foreground placeholder:text-muted-foreground px-4 py-3 rounded-lg text-sm outline-none border border-border focus:border-primary/50"
                />
                <datalist id="known-people">
                  {knownPeople.map(p => <option key={p} value={p} />)}
                </datalist>
                <input
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Descrição (ex: Mercado)"
                  maxLength={120}
                  className="w-full bg-secondary text-foreground placeholder:text-muted-foreground px-4 py-3 rounded-lg text-sm outline-none border border-border focus:border-primary/50"
                />
                <input
                  type="number" step="0.01" min="0"
                  value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder="Valor gasto"
                  className="w-full bg-secondary text-foreground placeholder:text-muted-foreground px-4 py-3 rounded-lg text-sm outline-none border border-border focus:border-primary/50"
                />
                <input
                  type="date"
                  value={form.transaction_date}
                  onChange={e => setForm(f => ({ ...f, transaction_date: e.target.value }))}
                  className="w-full bg-secondary text-foreground px-4 py-3 rounded-lg text-sm outline-none border border-border focus:border-primary/50"
                />
                <Button onClick={handleSave} className="w-full gradient-bg text-primary-foreground font-semibold">
                  {editing ? "Salvar Alterações" : "Adicionar"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Totais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <motion.div variants={itemVariants} className="glass-card p-5 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Total da Fatura</p>
            <p className="text-2xl font-bold font-display text-foreground">{fmt(total)}</p>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-primary" />
              <h2 className="font-display font-semibold text-foreground">Total por Pessoa</h2>
            </div>
            {byPerson.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum lançamento ainda.</p>
            ) : (
              <div className="space-y-2">
                {byPerson.map(([name, value]) => (
                  <div key={name} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{name}</span>
                    <span className="text-foreground font-semibold">{fmt(value)}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Lista de lançamentos */}
        {items.length > 0 ? (
          <motion.div variants={itemVariants} className="glass-card p-5">
            <h2 className="font-display font-semibold text-foreground mb-4">Lançamentos</h2>
            <div className="space-y-2">
              {items.map(t => (
                <div key={t.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors group">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{t.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.person_name} · {new Date(t.transaction_date + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{fmt(Number(t.amount))}</p>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(t)} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" aria-label="Editar lançamento">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" aria-label="Excluir lançamento">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : !loading && (
          <motion.div variants={itemVariants} className="glass-card p-10 text-center">
            <CreditCard className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="font-display font-semibold text-foreground text-lg mb-2">Nenhum lançamento ainda</h2>
            <p className="text-muted-foreground text-sm">Clique em "Novo Lançamento" para registrar um gasto do cartão.</p>
          </motion.div>
        )}
      </motion.div>
    </AppLayout>
  );
};

export default CardTransactions;
