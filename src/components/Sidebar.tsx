import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, MessageCircle, Target, BarChart3, LogOut, User, Wallet, CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const navItems = [
  { path: "/", label: "Painel", icon: LayoutDashboard },
  { path: "/cartao", label: "Cartão de Crédito", icon: CreditCard },
  { path: "/chat", label: "Chat IA", icon: MessageCircle },
  { path: "/metas", label: "Metas", icon: Target },
  { path: "/relatorios", label: "Relatórios", icon: BarChart3 },
];

const Sidebar = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [displayName, setDisplayName] = useState("Usuário");

  useEffect(() => {
    if (user) {
      supabase.from("profiles").select("display_name").eq("user_id", user.id).maybeSingle().then(({ data }) => {
        if (data?.display_name) setDisplayName(data.display_name);
      });
    }
  }, [user]);

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-50">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
          <Wallet className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="text-xl font-bold font-display text-foreground">Finança IA</div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}>
              <motion.div
                whileHover={{ x: 4 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-primary"
                  />
                )}
                <item.icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
            <User className="w-4 h-4 text-secondary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <button onClick={signOut} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Sair">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
