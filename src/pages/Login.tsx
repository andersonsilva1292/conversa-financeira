import { useState } from "react";
import { motion } from "framer-motion";
import { Wallet, Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 page-glow">
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
          <h1 className="text-3xl font-bold font-display text-foreground">FinançaIA</h1>
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

            <Button type="submit" className="w-full gradient-bg text-primary-foreground font-semibold py-3 hover:opacity-90 transition-opacity gap-2">
              {isSignup ? "Criar Conta" : "Entrar"}
              <ArrowRight className="w-4 h-4" />
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
    </div>
  );
};

export default Login;
