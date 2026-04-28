import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, User, Phone, AlertCircle, Building2 } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import Input from "@/components/reusable/Input";
import Button from "@/components/reusable/Button";
import SocialAuthButtons from "@/components/auth/SocialAuthButtons";
import { useAuthStore } from "@/store/useAuthStore";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SignupPage() {
  const [role, setRole] = useState<"participant" | "organizer">("participant");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Validation states
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [apiError, setApiError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { registerParticipant, registerOrganizer, isLoading } = useAuthStore();

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { label: "", color: "bg-transparent", width: "w-0" };
    if (pwd.length < 8) return { label: "Faible", color: "bg-red-500", width: "w-1/3" };
    const hasNum = /\d/.test(pwd);
    const hasSym = /[!@#$%^&*]/.test(pwd);
    if (hasNum && hasSym) return { label: "Fort", color: "bg-emerald-500", width: "w-full" };
    return { label: "Moyen", color: "bg-yellow-500", width: "w-2/3" };
  };

  const strength = getPasswordStrength(password);

  const validate = () => {
    let isValid = true;

    if (!name || name.trim().length < 2) {
      setNameError("Le nom complet doit faire au moins 2 caractères.");
      isValid = false;
    } else {
      setNameError("");
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setEmailError("Veuillez entrer une adresse email valide.");
      isValid = false;
    } else {
      setEmailError("");
    }

    // Phone is optional for participant but let's just make it valid if typed
    if (phone && phone.trim().length < 8) {
      setPhoneError("Veuillez entrer un numéro de téléphone valide.");
      isValid = false;
    } else {
      setPhoneError("");
    }

    if (!password || password.length < 8) {
      setPasswordError("Le mot de passe doit faire au moins 8 caractères.");
      isValid = false;
    } else {
      setPasswordError("");
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("Les mots de passe ne correspondent pas.");
      isValid = false;
    } else {
      setConfirmPasswordError("");
    }

    return isValid;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) return;

    try {
      if (role === "participant") {
        await registerParticipant({
          full_name: name,
          email,
          phone,
          password,
        });
        navigate("/account/registrations");
      } else {
        await registerOrganizer({
          full_name: name,
          email,
          phone,
          password,
        });
        navigate("/organizer/dashboard");
      }
    } catch (err) {
      if (err instanceof Error) {
        setApiError(err.message);
      } else {
        setApiError("Erreur lors de l'inscription");
      }
    }
  };

  return (
    <AuthLayout
      title="Créer un compte"
      subtitle="Rejoignez EventNest pour découvrir ou organiser des événements."
    >
      <Tabs defaultValue="participant" onValueChange={(v) => setRole(v as "participant" | "organizer")} className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="participant" className="text-xs sm:text-sm">Participant</TabsTrigger>
          <TabsTrigger value="organizer" className="text-xs sm:text-sm">Organisateur</TabsTrigger>
        </TabsList>
      </Tabs>

      <form onSubmit={handleRegister} className="space-y-5" noValidate>
        {apiError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}

        <Input
          label={role === "organizer" ? "Nom de l'organisation ou complet" : "Nom complet"}
          type="text"
          placeholder={role === "organizer" ? "EventCorp / John Doe" : "John Doe"}
          value={name}
          onChange={(e) => { setName(e.target.value); setNameError(""); }}
          leftIcon={role === "organizer" ? <Building2 size={18} /> : <User size={18} />}
          error={nameError}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Adresse email"
            type="email"
            placeholder="john@doe.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
            leftIcon={<Mail size={18} />}
            error={emailError}
            required
          />

          <Input
            label="Téléphone (Optionnel)"
            type="tel"
            placeholder="+33 6 12 34 56 78"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); setPhoneError(""); }}
            leftIcon={<Phone size={18} />}
            error={phoneError}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Input
              label="Mot de passe"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setPasswordError(""); }}
              leftIcon={<Lock size={18} />}
              error={passwordError}
              required
            />
            {password.length > 0 && (
              <div className="flex items-center gap-2 mt-1.5 px-1">
                <div className="flex-1 flex gap-1 h-1.5">
                  <div className={`h-full flex-1 rounded-full transition-colors duration-300 ${password.length > 0 ? (strength.label === 'Faible' ? 'bg-red-500' : strength.label === 'Moyen' ? 'bg-yellow-500' : 'bg-emerald-500') : 'bg-muted'}`} />
                  <div className={`h-full flex-1 rounded-full transition-colors duration-300 ${password.length >= 8 ? (strength.label === 'Moyen' ? 'bg-yellow-500' : strength.label === 'Fort' ? 'bg-emerald-500' : 'bg-muted') : 'bg-muted'}`} />
                  <div className={`h-full flex-1 rounded-full transition-colors duration-300 ${strength.label === 'Fort' ? 'bg-emerald-500' : 'bg-muted'}`} />
                </div>
                <span className={`text-[10px] uppercase font-bold tracking-wider w-14 text-right ${strength.label === 'Faible' ? 'text-red-500' : strength.label === 'Moyen' ? 'text-yellow-600' : 'text-emerald-500'}`}>
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          <Input
            label="Confirmer le mot de passe"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setConfirmPasswordError(""); }}
            leftIcon={<Lock size={18} />}
            error={confirmPasswordError}
            required
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          className="w-full h-12 mt-4 rounded-xl text-sm font-semibold shadow-md shadow-primary/20"
          rightIcon={!isLoading ? <ArrowRight size={16} /> : undefined}
        >
          {isLoading ? "Inscription en cours..." : (role === "organizer" ? "Créer mon compte organisateur" : "Créer mon compte participant")}
        </Button>
      </form>

      <SocialAuthButtons label="Ou s'inscrire avec" />

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Déjà un compte ?{" "}
        <Link to="/auth/login" className="font-semibold text-primary hover:underline">
          Connectez-vous
        </Link>
      </p>
    </AuthLayout>
  );
}
