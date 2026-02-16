import { ReactNode } from "react";
import Sidebar from "./Sidebar";

const AppLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-64 min-h-screen page-glow">
        <div className="relative z-10 p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
