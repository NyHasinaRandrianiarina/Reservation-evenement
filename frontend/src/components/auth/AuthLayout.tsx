import React from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: React.ReactNode;
  subtitle: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  return (
    <div className="min-h-screen bg-background relative flex flex-col items-center sm:justify-center p-4 sm:p-6 lg:p-8 overflow-x-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      {/* Floating Return Button */}
      <Link 
        to="/" 
        className="fixed top-6 left-6 z-50 flex items-center justify-center w-10 h-10 rounded-xl bg-card border border-border shadow-sm hover:border-primary hover:text-primary transition-all group"
        title="Retour à l'accueil"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[460px] py-8 sm:py-12"
      >
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground mb-2">
            {title}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground font-medium px-4">
            {subtitle}
          </p>
        </div>

        <div className="bg-card/50 border border-border rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm backdrop-blur-sm">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;

