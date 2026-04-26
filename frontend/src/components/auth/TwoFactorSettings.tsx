import { Loader2, Shield, ShieldCheck, ShieldOff, Lock } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import * as authApi from "@/api/auth";
import Button from "@/components/reusable/Button";
import Input from "@/components/reusable/Input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";

const enable2faSchema = z.object({
  password: z.string().min(1, "Mot de passe requis"),
});

const confirm2faSchema = z.object({
  code: z.string().regex(/^[0-9]{6}$/, "Le code doit contenir 6 chiffres"),
});

const disable2faSchema = z.object({
  password: z.string().min(1, "Mot de passe requis"),
});

type EnableFormData = z.infer<typeof enable2faSchema>;
type ConfirmFormData = z.infer<typeof confirm2faSchema>;
type DisableFormData = z.infer<typeof disable2faSchema>;

export default function TwoFactorSettings() {
  const { user, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"idle" | "enable" | "confirm" | "disable">("idle");

  // Enable 2FA
  const enableForm = useForm<EnableFormData>({
    resolver: zodResolver(enable2faSchema),
  });
  const onEnable = async (_data: EnableFormData) => {
    setIsLoading(true);
    try {
      await authApi.enable2fa();
      toast.success("Code de vérification envoyé par email");
      setStep("confirm");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de l'activation");
    } finally {
      setIsLoading(false);
    }
  };

  // Confirm 2FA
  const confirmForm = useForm<ConfirmFormData>({
    resolver: zodResolver(confirm2faSchema),
  });
  const onConfirm = async (data: ConfirmFormData) => {
    setIsLoading(true);
    try {
      await authApi.confirm2fa(data);
      toast.success("Authentification à deux facteurs activée");
      setStep("idle");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Code invalide");
    } finally {
      setIsLoading(false);
    }
  };

  // Disable 2FA
  const disableForm = useForm<DisableFormData>({
    resolver: zodResolver(disable2faSchema),
  });
  const onDisable = async (_data: DisableFormData) => {
    setIsLoading(true);
    try {
      await authApi.disable2fa();
      toast.success("Authentification à deux facteurs désactivée");
      setStep("idle");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la désactivation");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || !user) return null;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Authentification à deux facteurs (2FA)
        </h2>
        <p className="text-sm text-muted-foreground">
          Ajoutez une couche de sécurité à votre compte avec un code envoyé par email.
        </p>
      </div>

      {/* Current status */}
      <div className="bg-muted/30 rounded-2xl p-6 border border-border/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {user.two_fa_enabled ? (
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
            ) : (
              <ShieldOff className="w-6 h-6 text-amber-600" />
            )}
            <div>
              <p className="font-medium text-foreground">
                {user.two_fa_enabled ? "2FA activé" : "2FA désactivé"}
              </p>
              <p className="text-xs text-muted-foreground">
                {user.two_fa_enabled
                  ? "Un code vous sera demandé à chaque connexion."
                  : "Votre compte n'est pas protégé par 2FA."}
              </p>
            </div>
          </div>
          {step === "idle" && (
            <Button
              size="sm"
              variant={user.two_fa_enabled ? "outline" : "primary"}
              onClick={() => setStep(user.two_fa_enabled ? "disable" : "enable")}
            >
              {user.two_fa_enabled ? "Désactiver" : "Activer"}
            </Button>
          )}
        </div>
      </div>

      {/* Enable 2FA */}
      {step === "enable" && (
        <div className="bg-background rounded-2xl p-6 border border-border/40">
          <h3 className="font-semibold text-foreground mb-4">Activer la 2FA</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Vous recevrez un code à 6 chiffres par email pour confirmer l'activation.
          </p>
          <form onSubmit={enableForm.handleSubmit(onEnable)} className="space-y-4">
            <Input
              label="Mot de passe"
              type="password"
              leftIcon={<Lock size={18} />}
              {...enableForm.register("password")}
              error={enableForm.formState.errors.password?.message}
            />
            <div className="flex gap-3">
              <Button type="submit" disabled={isLoading} className="gap-2">
                {isLoading && <Loader2 size={16} className="animate-spin" />}
                Envoyer le code
              </Button>
              <Button type="button" variant="ghost" onClick={() => setStep("idle")}>
                Annuler
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Confirm 2FA */}
      {step === "confirm" && (
        <div className="bg-background rounded-2xl p-6 border border-border/40">
          <h3 className="font-semibold text-foreground mb-4">Confirmer l'activation</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Saisissez le code à 6 chiffres reçu par email.
          </p>
          <form onSubmit={confirmForm.handleSubmit(onConfirm)} className="space-y-4">
            <Input
              label="Code OTP"
              placeholder="482910"
              leftIcon={<Shield size={18} />}
              {...confirmForm.register("code")}
              error={confirmForm.formState.errors.code?.message}
            />
            <div className="flex gap-3">
              <Button type="submit" disabled={isLoading} className="gap-2">
                {isLoading && <Loader2 size={16} className="animate-spin" />}
                Confirmer
              </Button>
              <Button type="button" variant="ghost" onClick={() => setStep("idle")}>
                Annuler
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Disable 2FA */}
      {step === "disable" && (
        <div className="bg-background rounded-2xl p-6 border border-border/40">
          <h3 className="font-semibold text-foreground mb-4">Désactiver la 2FA</h3>
          <p className="text-sm text-muted-foreground mb-4">
            La désactivation révoquera toutes vos sessions. Vous devrez vous reconnecter.
          </p>
          <form onSubmit={disableForm.handleSubmit(onDisable)} className="space-y-4">
            <Input
              label="Mot de passe"
              type="password"
              leftIcon={<Lock size={18} />}
              {...disableForm.register("password")}
              error={disableForm.formState.errors.password?.message}
            />
            <div className="flex gap-3">
              <Button type="submit" variant="outline" disabled={isLoading} className="gap-2">
                {isLoading && <Loader2 size={16} className="animate-spin" />}
                Désactiver
              </Button>
              <Button type="button" variant="ghost" onClick={() => setStep("idle")}>
                Annuler
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
