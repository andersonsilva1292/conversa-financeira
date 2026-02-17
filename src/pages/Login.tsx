import { useState } from "react";
import { motion } from "framer-motion";
import { Wallet, Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();

  // Redirect if already logged in
  if (user) {
    navigate("/", { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignup) {
      const { error } = await signUp(email, password, name);
      if (error) {
        toast.error(error);
      } else {
        toast.success("Conta criada! Verifique seu email para confirmar.");
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error);
      } else {
        navigate("/");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 page-glow relative">
      {/* Logo no canto superior direito */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
        <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
          <Wallet className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold font-display text-foreground">Finança IA</span>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
            <Wallet className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold font-display text-foreground">Finança IA</h1>
          <p className="text-muted-foreground mt-2">Sua inteligência financeira pessoal</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="glass-card p-8"
        >
          <h2 className="text-xl font-display font-semibold text-foreground mb-6">
            {isSignup ? "Criar Conta" : "Entrar"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-secondary text-foreground placeholder:text-muted-foreground pl-10 pr-4 py-3 rounded-lg text-sm outline-none border border-border focus:border-primary/50 transition-colors"
                  aria-label="Nome completo"
                  required
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-secondary text-foreground placeholder:text-muted-foreground pl-10 pr-4 py-3 rounded-lg text-sm outline-none border border-border focus:border-primary/50 transition-colors"
                aria-label="Email"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-secondary text-foreground placeholder:text-muted-foreground pl-10 pr-12 py-3 rounded-lg text-sm outline-none border border-border focus:border-primary/50 transition-colors"
                aria-label="Senha"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full gradient-bg text-primary-foreground font-semibold py-3 hover:opacity-90 transition-opacity gap-2"
            >
              {loading ? "Carregando..." : isSignup ? "Criar Conta" : "Entrar"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isSignup ? "Já tem conta? " : "Não tem conta? "}
              <span className="text-primary font-medium">{isSignup ? "Entrar" : "Cadastre-se"}</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Rodapé */}
      <p className="absolute bottom-4 text-xs text-muted-foreground/50">
        Desenvolvido por Anderson dos Santos Silva
      </p>
    </div>
  );
};

export default Login;
