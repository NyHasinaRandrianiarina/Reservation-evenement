import {  Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  Package,
  Truck,
  CheckCircle2,
  ArrowRight,
  Check,
  UserPlus,
  LayoutDashboard,
  Eye,
  Clock,
  UserCheck,
  PackageCheck,
  CircleCheckBig,
  ShieldCheck,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import LandingLayout from "@/components/layouts/LandingLayout";
import Button from "@/components/reusable/Button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import landingData from "@/data/landingData.json";

/* ──────────────────────────────────────────────
   Icon map — resolves icon name strings from JSON
   ────────────────────────────────────────────── */
const iconMap: Record<string, React.ElementType> = {
  Package, Truck, CheckCircle2, UserPlus, LayoutDashboard, Eye,
  Clock, UserCheck, PackageCheck, CircleCheckBig,
};

function getIcon(name: string, size = 20, className = "") {
  const Icon = iconMap[name];
  return Icon ? <Icon size={size} className={className} /> : null;
}

/* ──────────────────────────────────────────────
   Scroll animation wrapper
   ────────────────────────────────────────────── */
function FadeInSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════
   SECTION 1 — HERO
   ══════════════════════════════════════════════════════ */
function HeroSection() {
  return (
    <section id="hero" className="relative min-h-[90vh] flex items-center overflow-hidden pt-20 pb-16">
      {/* Grid Background */}
      <div className="absolute inset-0 -z-10 bg-background flex items-center justify-center">
        {/* The Grid */}
        <div
          className={cn(
            "absolute inset-0 opacity-50",
            "[background-size:40px_40px]",
            "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
            "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]"
          )}
        />
        {/* Radial gradient mask to fade the grid at the edges */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_40%,black)]"></div>
        
        {/* Subtle color meshes */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen" />
      </div>

      <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — Copy */}
          <div className="flex flex-col gap-8">
            <FadeInSection>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10 w-fit">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span className="text-xs font-semibold text-primary tracking-wide">Agence de livraison</span>
              </div>
            </FadeInSection>

            <FadeInSection delay={0.1}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.15]">
                Gérez vos livraisons, <span className="text-primary">de bout en bout.</span>
              </h1>
              <p className="text-xl sm:text-2xl text-muted-foreground mt-4 max-w-lg leading-relaxed">
                TrackIt centralise toutes les opérations de votre agence de livraison en une seule plateforme.
              </p>
            </FadeInSection>

            <FadeInSection delay={0.2}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Link to="/register">
                  <Button
                    variant="primary"
                    size="lg"
                    className="rounded-full shadow-md shadow-primary/20 hover:shadow-lg transition-all px-8 h-12 text-sm font-semibold"
                    rightIcon={<ArrowRight size={16} />}
                  >
                    Déposer un colis
                  </Button>
                </Link>
                <Link to="/track">
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-full px-8 h-12 text-sm font-semibold border-border/60 hover:bg-primary/5 hover:text-primary transition-colors"
                    rightIcon={<Search size={16} />}
                  >
                    Suivre un colis
                  </Button>
                </Link>
              </div>
            </FadeInSection>

            <FadeInSection delay={0.3}>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-primary"/> Gratuit
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-primary"/> Sans engagement
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} className="text-primary"/> Prêt en 2 minutes
                </span>
              </div>
            </FadeInSection>
          </div>

          {/* Right — Glassmorphism App mockup */}
          <FadeInSection delay={0.4} className="hidden lg:block relative">
            <div className="relative mx-auto w-full max-w-[420px]">
              {/* Glass Card */}
              <div className="relative bg-background/60 backdrop-blur-2xl border border-border/50 rounded-3xl shadow-[0_8px_40px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.2)] p-6 space-y-6 overflow-hidden">
                {/* Glossy reflection overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 dark:via-white/5 to-transparent opacity-50 pointer-events-none" />
                
                {/* Header */}
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Package size={18} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">Colis TRK-A83KZ1</h3>
                      <p className="text-xs text-muted-foreground font-medium">Il y a 2 minutes</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-600 border border-orange-500/20">
                    En transit
                  </span>
                </div>

                {/* Animated Timeline */}
                <div className="space-y-4 py-2 relative z-10">
                  {[
                    { label: "Demande soumise", time: "12 avr. · 09:14", done: true },
                    { label: "Validée par l'agence", time: "12 avr. · 10:30", done: true },
                    { label: "Livreur assigné (Marc)", time: "13 avr. · 08:00", done: true },
                    { label: "En transit", time: "13 avr. · 09:45", active: true },
                    { label: "Livré au destinataire", time: "En attente", pending: true },
                  ].map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="relative flex flex-col items-center">
                        <div className={`w-3.5 h-3.5 rounded-full z-10 border-[3px] border-background ${step.active ? 'bg-primary ring-2 ring-primary/30 animate-pulse' : step.done ? 'bg-primary' : 'bg-muted border-border'}`} />
                        {i !== 4 && <div className={`w-[1.5px] h-full absolute top-3 ${step.done ? 'bg-primary/40' : 'bg-border/50'}`} />}
                      </div>
                      <div className="flex-1 pb-3">
                        <p className={`text-[13px] ${step.active ? 'font-bold text-foreground' : step.done ? 'text-foreground/80 font-medium' : 'text-muted-foreground font-medium'}`}>{step.label}</p>
                        <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{step.time}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Small floating badge */}
                <motion.div 
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -right-2 -bottom-2 bg-background border border-border/60 shadow-lg rounded-2xl p-3 flex items-center gap-3 z-20"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center">
                    <Check size={14} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Traçabilité complète</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Garanti TrackIt</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </FadeInSection>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   SECTION 2 — STATS (Chiffres clés)
   ══════════════════════════════════════════════════════ */
function StatsSection() {
  return (
    <section id="stats" className="py-16 border-y border-border/40 bg-muted/20">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {landingData.stats.map((stat, i) => (
            <FadeInSection key={stat.label} delay={i * 0.1}>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="text-4xl sm:text-5xl font-black tracking-tight text-foreground">
                  {stat.value}<span className="text-primary">{stat.suffix}</span>
                </div>
                <p className="text-sm text-muted-foreground font-semibold">{stat.label}</p>
              </div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   SECTION 3 — FEATURES (Fonctionnalités par rôle)
   ══════════════════════════════════════════════════════ */
function FeaturesSection() {
  const tabs = [
    { key: "expediteur", ...landingData.features.expediteur },
    { key: "livreur", ...landingData.features.livreur },
    { key: "admin", ...landingData.features.admin },
  ];

  return (
    <section id="features" className="py-20 lg:py-28 bg-muted/10 border-t border-border/30">
      <div className="max-w-6xl mx-auto px-6">
        <FadeInSection className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground mb-4">
            Une plateforme, <span className="text-primary">trois expériences</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto font-medium">
            Chaque rôle dispose d'un espace dédié pour une gestion optimale des livraisons.
          </p>
        </FadeInSection>

        <Tabs defaultValue="expediteur" className="w-full">
          <TabsList className="mx-auto mb-12 bg-background border border-border/60 rounded-full p-1.5 h-auto flex flex-wrap justify-center max-w-fit shadow-sm">
            {tabs.map((tab) => {
              const TabIcon = iconMap[tab.icon] || Package;
              return (
                <TabsTrigger
                  key={tab.key}
                  value={tab.key}
                  className="rounded-full px-6 py-2.5 text-[13px] font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all gap-2"
                >
                  <TabIcon size={16} />
                  {tab.role}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.key} value={tab.key} className="mt-0 focus-visible:outline-none">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  {tab.items.map((item, i) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06, duration: 0.4 }}
                      className="flex items-start gap-4"
                    >
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={12} className="text-primary font-bold" />
                      </div>
                      <span className="text-foreground/90 font-medium leading-relaxed">{item}</span>
                    </motion.div>
                  ))}
                  <div className="pt-4">
                     <Link to="/register">
                       <Button variant="outline" className="rounded-full text-sm font-semibold hover:bg-primary/5 hover:text-primary transition-colors border-border/60">
                         Découvrir l'espace {tab.role} <ArrowRight size={14} className="ml-2"/>
                       </Button>
                     </Link>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-accent/10 rounded-[2.5rem] blur-2xl transform scale-95" />
                  <div className="relative bg-card border border-border/50 rounded-[2rem] shadow-xl shadow-black/5 p-8 space-y-6 max-w-md mx-auto">
                    <div className="flex items-center gap-4 pb-5 border-b border-border/40">
                       <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                         {getIcon(tab.icon, 24, "text-primary")}
                       </div>
                       <div>
                         <h4 className="font-bold text-foreground text-lg">Interface {tab.role}</h4>
                         <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-0.5">Vue simplifiée</p>
                       </div>
                    </div>
                    <div className="space-y-4">
                      {[1,2,3].map((i) => (
                         <div key={i} className="h-14 w-full rounded-xl bg-muted/30 border border-border/30 flex items-center px-4 gap-4">
                            <div className="w-8 h-8 rounded-lg bg-background border border-border/50 shadow-sm flex items-center justify-center">
                               {i === 1 ? <Check size={14} className="text-primary"/> : <div className="w-2 h-2 rounded-full bg-muted-foreground/20"/>}
                            </div>
                            <div className="flex-1 space-y-2">
                               <div className="h-2 w-1/2 bg-muted-foreground/20 rounded-full" />
                               <div className="h-2 w-1/3 bg-muted-foreground/10 rounded-full" />
                            </div>
                         </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   SECTION 4 — HOW IT WORKS
   ══════════════════════════════════════════════════════ */
function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <FadeInSection className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground mb-4">
            Comment ça <span className="text-primary">marche</span> ?
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto font-medium">
            De la demande à la livraison en 4 étapes simples
          </p>
        </FadeInSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4 relative">
          <div className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-px bg-border/80" />

          {landingData.steps.map((step, i) => (
            <FadeInSection key={step.number} delay={i * 0.1}>
              <div className="relative flex flex-col items-center text-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-background border border-border shadow-sm flex items-center justify-center font-black text-lg text-foreground relative z-10 group-hover:border-primary group-hover:text-primary transition-colors">
                  {step.number}
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mt-2 group-hover:scale-110 transition-transform">
                  {getIcon(step.icon, 22, "text-primary")}
                </div>
                <h3 className="text-base font-bold text-foreground mt-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground font-medium">{step.description}</p>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">{step.actor}</span>
              </div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   SECTION 5 — STATUS TIMELINE
   ══════════════════════════════════════════════════════ */
function StatusTimelineSection() {
  return (
    <section id="timeline" className="py-20 lg:py-28 bg-muted/10 border-t border-border/30">
      <div className="max-w-3xl mx-auto px-6">
        <FadeInSection className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground mb-4">
            Cycle de vie d'une <span className="text-primary">livraison</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto font-medium">
            Chaque colis passe par ces étapes, avec une traçabilité complète à chaque transition.
          </p>
        </FadeInSection>

        <div className="relative">
          {/* Vertical connecting line */}
          <div className="absolute left-6 top-8 bottom-8 w-px bg-border/60" />

          <div className="space-y-0">
            {landingData.timeline.map((item, i) => (
              <FadeInSection key={item.status} delay={i * 0.08}>
                <div className="flex items-start gap-6 group relative py-5">
                  {/* Circle */}
                  <div className={cn(
                    "relative z-10 w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 transition-all duration-300",
                    "group-hover:scale-110 group-hover:shadow-lg",
                    item.colorClass
                  )}>
                    {getIcon(item.icon, 20)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 bg-background border border-border/40 rounded-2xl p-5 shadow-sm group-hover:shadow-md group-hover:border-border/60 transition-all">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-foreground">{item.label}</h4>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full">
                        {item.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">
                      Déclenché par : <span className="text-foreground/80">{item.actor}</span>
                    </p>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   SECTION 6 — CTA
   ══════════════════════════════════════════════════════ */
function CTASection() {
  return (
    <section id="cta" className="py-24 relative overflow-hidden bg-background border-t border-border/30">
      {/* Sleek radial gradient */}
      <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
         <div className="w-[800px] h-[400px] bg-primary/30 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
        <FadeInSection>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground mb-6">
            Prêt à digitaliser votre <span className="font-serif italic text-primary">agence</span> ?
          </h2>
        </FadeInSection>

        <FadeInSection delay={0.1}>
          <p className="text-lg text-muted-foreground mb-10 max-w-md mx-auto font-medium">
            Rejoignez TrackIt et offrez une traçabilité complète à vos expéditeurs et destinataires.
          </p>
        </FadeInSection>

        <FadeInSection delay={0.2}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button
                size="lg"
                className="rounded-full shadow-lg shadow-primary/20 hover:shadow-xl transition-all h-14 px-10 text-base font-bold"
                rightIcon={<ArrowRight size={18} />}
              >
                Créer un compte expéditeur
              </Button>
            </Link>
            <Link to="/register/delivery">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full h-14 px-10 text-base font-bold border-border/60 hover:bg-primary/5 hover:text-primary transition-colors"
              >
                Rejoindre en tant que livreur
              </Button>
            </Link>
          </div>
        </FadeInSection>

        <FadeInSection delay={0.3}>
          <p className="text-sm text-muted-foreground font-medium mt-8">
            Déjà inscrit ? <Link to="/login" className="text-primary hover:underline font-bold">Se connecter</Link>
          </p>
        </FadeInSection>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════════ */
export default function LandingPage() {
  // const { isAuthenticated, user } = useAuthStore();
  // const navigate = useNavigate();

  // useEffect(() => {
  //   if (!isAuthenticated || !user) return;

  //   const roleDashboards: Record<string, string> = {
  //     SENDER: "/sender/dashboard",
  //     DELIVERY: "/delivery/dashboard",
  //     ADMIN: "/admin/dashboard",
  //   };

  //   const target = roleDashboards[user.role] || "/sender/dashboard";
  //   navigate(target, { replace: true });
  // }, [isAuthenticated, user, navigate]);

  // if (isAuthenticated && user) return null;

  return (
    <LandingLayout>
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <StatusTimelineSection />
      <CTASection />
    </LandingLayout>
  );
}
