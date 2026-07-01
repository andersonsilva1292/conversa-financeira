import { motion } from "framer-motion";
import { CreditCard, Plus, Pencil, Trash2, Users } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

type CardTx = {
  id: string;
  person_name: string;
  description: string;
  amount: number;
  transaction_date: string;
  category: string;
  payment_type: string;
  total_installments: number;
  paid_installments: number;
  created_at?: string;
};

const CATEGORIES = [
  "Moradia & Home",
  "Alimentação & Consumo",
  "Transporte",
  "Lazer & Estilo de Vida",
  "Contas Divididas",
];

const PERSON_COLORS = [
  "from-emerald-500/20 to-emerald-500/5 border-emerald-500/30",
  "from-sky-500/20 to-sky-500/5 border-sky-500/30",
  "from-violet-500/20 to-violet-500/5 border-violet-500/30",
  "from-amber-500/20 to-amber-500/5 border-amber-500/30",
  "from-rose-500/20 to-rose-500/5 border-rose-500/30",
];

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const fmt = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const emptyForm = () => ({
  person_name: "",
  description: "",
  amount: "",
  transaction_date: new Date().toISOString().split("T")[0],
  category: CATEGORIES[0],
  is_installment: false,
  total_installments: "1",
  paid_installments: "0",
});

const DEFAULT_PEOPLE = ["ANDERSON", "SANDOVAL", "MÃE"];
const PERSON_ORDER = ["ANDERSON", "SANDOVAL", "MÃE"];
const personRank = (name: string) => {
  const idx = PERSON_ORDER.findIndex(p => p.localeCompare(name, "pt-BR", { sensitivity: "base" }) === 0);
  return idx === -1 ? PERSON_ORDER.length : idx;
};

const CardTransactions = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<CardTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CardTx | null>(null);
  const [form, setForm] = useState(emptyForm());

  const fetchItems = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("card_transactions")
      .select("*")
      .eq("user_id", user.id);
    const rows = (data as CardTx[]) || [];
    rows.sort((a, b) => {
      if (a.transaction_date !== b.transaction_date) {
        return a.transaction_date < b.transaction_date ? 1 : -1;
      }
      const ra = personRank(a.person_name);
      const rb = personRank(b.person_name);
      if (ra !== rb) return ra - rb;
      return a.person_name.localeCompare(b.person_name, "pt-BR");
    });
    setItems(rows);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, [user]);

  const knownPeople = useMemo(
    () => Array.from(new Set([...DEFAULT_PEOPLE, ...items.map(i => i.person_name).filter(Boolean)])),
    [items]
  );

  const knownDescriptions = useMemo(
    () => Array.from(new Set(items.map(i => i.description).filter(Boolean))).slice(0, 100),
    [items]
  );

  // Total devedor por pessoa = apenas a parcela do mês atual (não soma parcelas futuras)
  const byPerson = useMemo(() => {
    const m: Record<string, { pending: number; current: number }> = {};
    items.forEach(i => {
      const total = Number(i.amount);
      const n = Math.max(1, i.total_installments || 1);
      const p = Math.min(n, Math.max(0, i.paid_installments || 0));
      const installmentValue = total / n;
      const remaining = n - p;
      const current = remaining > 0 ? installmentValue : 0;
      if (!m[i.person_name]) m[i.person_name] = { pending: 0, current: 0 };
      m[i.person_name].pending += current;
      m[i.person_name].current += current;
    });
    return Object.entries(m).sort((a, b) => b[1].pending - a[1].pending);
  }, [items]);

  const totalPending = byPerson.reduce((a, [, v]) => a + v.pending, 0);

  const resetForm = () => {
    setEditing(null);
    setForm(emptyForm());
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
    const isParc = form.is_installment;
    const total_installments = isParc ? Math.max(1, parseInt(form.total_installments) || 1) : 1;
    const paid_installments = isParc ? Math.max(0, parseInt(form.paid_installments) || 0) : 0;
    if (paid_installments > total_installments) {
      toast.error("Parcelas pagas não podem ser maiores que o total.");
      return;
    }

    const payload = {
      person_name: person,
      description: desc,
      amount,
      transaction_date: form.transaction_date,
      category: form.category,
      payment_type: isParc ? "Parcelado" : "A Vista",
      total_installments,
      paid_installments,
    };

    if (editing) {
      const { error } = await supabase.from("card_transactions").update(payload).eq("id", editing.id);
      if (error) return toast.error(error.message);
      toast.success("Lançamento atualizado!");
    } else {
      const { error } = await supabase.from("card_transactions").insert({ user_id: user.id, ...payload });
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
    const isParc = (t.payment_type === "Parcelado") || (t.total_installments > 1);
    setForm({
      person_name: t.person_name,
      description: t.description,
      amount: String(t.amount),
      transaction_date: t.transaction_date,
      category: t.category || CATEGORIES[0],
      is_installment: isParc,
      total_installments: String(t.total_installments || 1),
      paid_installments: String(t.paid_installments || 0),
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
              Lance gastos parcelados, atribua a um responsável e acompanhe o saldo devedor de cada pessoa.
            </p>
          </div>
          <Dialog open={showForm} onOpenChange={(open) => { setShowForm(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gradient-bg text-primary-foreground font-semibold gap-2 hover:opacity-90 transition-opacity">
                <Plus className="w-4 h-4" />
                Novo Lançamento
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display">
                  {editing ? "Editar Lançamento" : "Novo Lançamento de Cartão"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Quem gastou</label>
                  <input
                    list="known-people"
                    value={form.person_name}
                    onChange={e => setForm(f => ({ ...f, person_name: e.target.value }))}
                    placeholder="Ex: Anderson, Mariana"
                    aria-label="Quem gastou"
                    maxLength={60}
                    className="w-full bg-secondary text-foreground placeholder:text-muted-foreground px-4 py-3 rounded-lg text-sm outline-none border border-border focus:border-primary/50"
                  />
                  <datalist id="known-people">
                    {knownPeople.map(p => <option key={p} value={p} />)}
                  </datalist>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Descrição</label>
                  <input
                    list="known-descriptions"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Ex: Supermercado, UBER, Aluguel..."
                    aria-label="Descrição do lançamento"
                    maxLength={120}
                    className="w-full bg-secondary text-foreground placeholder:text-muted-foreground px-4 py-3 rounded-lg text-sm outline-none border border-border focus:border-primary/50"
                  />
                  <datalist id="known-descriptions">
                    {knownDescriptions.map(d => <option key={d} value={d} />)}
                  </datalist>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Valor total</label>
                    <input
                      type="number" step="0.01" min="0"
                      value={form.amount}
                      onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                      placeholder="0,00"
                      aria-label="Valor total"
                      className="w-full bg-secondary text-foreground placeholder:text-muted-foreground px-4 py-3 rounded-lg text-sm outline-none border border-border focus:border-primary/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Data</label>
                    <input
                      type="date"
                      value={form.transaction_date}
                      onChange={e => setForm(f => ({ ...f, transaction_date: e.target.value }))}
                      aria-label="Data do lançamento"
                      className="w-full bg-secondary text-foreground px-4 py-3 rounded-lg text-sm outline-none border border-border focus:border-primary/50"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Categoria</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    aria-label="Categoria"
                    className="w-full bg-secondary text-foreground px-4 py-3 rounded-lg text-sm outline-none border border-border focus:border-primary/50"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <label className="flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary/50 border border-border cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_installment}
                    onChange={e => setForm(f => ({ ...f, is_installment: e.target.checked }))}
                    aria-label="Esta compra é parcelada"
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="text-sm text-foreground">Esta compra é parcelada?</span>
                </label>

                {form.is_installment && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground">Total de parcelas (N)</label>
                      <input
                        type="number" min="1" step="1"
                        value={form.total_installments}
                        onChange={e => setForm(f => ({ ...f, total_installments: e.target.value }))}
                        aria-label="Total de parcelas"
                        className="w-full bg-secondary text-foreground px-4 py-3 rounded-lg text-sm outline-none border border-border focus:border-primary/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground">Parcelas já pagas (P)</label>
                      <input
                        type="number" min="0" step="1"
                        value={form.paid_installments}
                        onChange={e => setForm(f => ({ ...f, paid_installments: e.target.value }))}
                        aria-label="Parcelas já pagas"
                        className="w-full bg-secondary text-foreground px-4 py-3 rounded-lg text-sm outline-none border border-border focus:border-primary/50"
                      />
                    </div>
                    {form.amount && parseInt(form.total_installments) > 0 && (
                      <div className="col-span-2 text-xs text-muted-foreground px-1">
                        Valor por parcela:{" "}
                        <span className="text-primary font-semibold">
                          {fmt(parseFloat(form.amount) / Math.max(1, parseInt(form.total_installments)))}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <Button onClick={handleSave} className="w-full gradient-bg text-primary-foreground font-semibold">
                  {editing ? "Salvar Alterações" : "Adicionar"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Cards de saldo devedor por pessoa */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <motion.div variants={itemVariants} className="glass-card p-5 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" />
              <p className="text-sm text-muted-foreground">Total devedor (geral)</p>
            </div>
            <p className="text-2xl font-bold font-display text-foreground">{fmt(totalPending)}</p>
            <p className="text-xs text-muted-foreground">Soma das parcelas restantes de todos os lançamentos.</p>
          </motion.div>

          {byPerson.map(([name, v], idx) => (
            <motion.div
              key={name}
              variants={itemVariants}
              className={`rounded-xl p-5 border bg-gradient-to-br ${PERSON_COLORS[idx % PERSON_COLORS.length]} flex flex-col gap-2`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-foreground/80" />
                <p className="text-sm text-foreground/80">{name} deve</p>
              </div>
              <p className="text-2xl font-bold font-display text-foreground">{fmt(v.pending)}</p>
              <p className="text-xs text-foreground/70">Mês atual: <span className="font-semibold">{fmt(v.current)}</span></p>
            </motion.div>
          ))}
        </div>

        {/* Lista de lançamentos */}
        {items.length > 0 ? (
          <motion.div variants={itemVariants} className="glass-card p-5">
            <h2 className="font-display font-semibold text-foreground mb-4">Lançamentos</h2>
            <div className="space-y-2">
              {items.map(t => {
                const n = Math.max(1, t.total_installments || 1);
                const p = Math.min(n, Math.max(0, t.paid_installments || 0));
                const installmentValue = Number(t.amount) / n;
                const isParc = n > 1 || t.payment_type === "Parcelado";
                const currentNumber = Math.min(n, p + 1);
                const remaining = n - p;
                return (
                  <div key={t.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors group">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      <CreditCard className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-foreground truncate">{t.description}</p>
                        <Badge variant="outline" className="text-[10px] py-0">{t.category}</Badge>
                        {isParc ? (
                          <Badge className="text-[10px] py-0 bg-primary/15 text-primary border-primary/30 hover:bg-primary/20">
                            Parcela {currentNumber}/{n} · faltam {remaining}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px] py-0">À Vista</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {t.person_name} · {new Date(t.transaction_date + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                        {t.created_at && <> · registrado {new Date(t.created_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })}</>}
                        {isParc && <> · parcela {fmt(installmentValue)}</>}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-foreground whitespace-nowrap">{fmt(Number(t.amount))}</p>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(t)} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" aria-label="Editar lançamento">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" aria-label="Excluir lançamento">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
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
