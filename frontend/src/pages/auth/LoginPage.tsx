import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import Input from "@/components/reusable/Input";
import Button from "@/components/reusable/Button";
import SocialAuthButtons from "@/components/auth/SocialAuthButtons";
import { useAuthStore } from "@/store/useAuthStore";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await login({ email, password });
      if (res.requires2fa) {
        // Handle 2FA redirect if needed
      } else {
        // Redirection based on role
        const currentUser = useAuthStore.getState().user;
        if (currentUser?.role === "ADMIN") navigate("/admin/dashboard");
        else if (currentUser?.role === "ORGANIZER") navigate("/organizer/dashboard");
        else navigate("/account/registrations");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Email ou mot de passe incorrect");
      }
    }
  };

  return (
    <AuthLayout
      title="Bon retour !"
      subtitle="Connectez-vous à votre espace"
    >
      <form onSubmit={handleLogin} className="space-y-5">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Input
          label="Adresse email"
          type="email"
          placeholder="nom@exemple.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail size={18} />}
          autoFocus
          required
        />
        
        <div className="space-y-1.5">
          <Input
            label="Mot de passe"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock size={18} />}
            rightIcon={
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="hover:text-foreground cursor-pointer focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
            required
          />
          <div className="flex items-center justify-between mt-2">
            <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
              <input type="checkbox" className="rounded border-border/50 bg-background text-primary focus:ring-primary/20 cursor-pointer" />
              Se souvenir de moi
            </label>
            <Link to="#" className="text-xs font-medium text-primary hover:underline transition-colors">
              Mot de passe oublié ?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          className="w-full h-12 mt-2 rounded-xl text-sm font-semibold shadow-md shadow-primary/20"
          rightIcon={!isLoading ? <ArrowRight size={16} /> : undefined}
        >
          {isLoading ? "Connexion en cours..." : "Se connecter"}
        </Button>
      </form>

      <SocialAuthButtons label="Ou continuer avec" />

      <div className="mt-6 flex flex-col items-center gap-2.5 text-sm text-muted-foreground">
        <p className="text-xs">Pas encore de compte ?</p>
        <Link 
          to="/register" 
          className="flex items-center justify-center gap-1.5 font-bold text-foreground hover:text-primary transition-all bg-muted/40 hover:bg-muted/60 px-4 py-2 rounded-xl w-full sm:w-auto text-[13px]"
        >
          Créer un compte
          <ArrowRight size={14} />
        </Link>
      </div>
    </AuthLayout>
  );
}
