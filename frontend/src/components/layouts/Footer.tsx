import { Package, Facebook, Instagram, Twitter } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-transparent pt-20 pb-10 px-6 border-t border-border/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          
          {/* Colonne Marque — Largeur dominante */}
          <div className="md:col-span-4 flex flex-col items-start">
            <div className="flex items-center gap-3 mb-6 group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors duration-500">
                <Package size={20} className="text-primary group-hover:text-white transition-colors" />
              </div>
              <span className="text-xl font-bold tracking-tighter text-foreground italic font-serif">
                TrackIt
              </span>
            </div>
            <p className="text-[13px] leading-relaxed text-muted-foreground max-w-[280px] font-medium">
              La plateforme de suivi de commandes et livraisons pour tous.
            </p>
          </div>

          {/* Navigation — Colonnes fines et espacées */}
          <div className="md:col-span-2 flex flex-col gap-6">
            <h4 className="text-[10px] font-black tracking-[0.2em] text-foreground uppercase">Plateforme</h4>
            <nav className="flex flex-col gap-4">
              {["Catalogue", "Vendeurs", "Expérience"].map((item) => (
                <a key={item} href={`/${item.toLowerCase()}`} className="text-[12px] font-medium text-muted-foreground hover:text-primary transition-colors w-fit">
                  {item}
                </a>
              ))}
            </nav>
          </div>

          <div className="md:col-span-2 flex flex-col gap-6">
            <h4 className="text-[10px] font-black tracking-[0.2em] text-foreground uppercase">Partenaires</h4>
            <nav className="flex flex-col gap-4">
              {["Devenir Vendeur", "Dashboard", "Conciergerie"].map((item) => (
                <a key={item} href={`/${item.toLowerCase().replace(" ", "-")}`} className="text-[12px] font-medium text-muted-foreground hover:text-primary transition-colors w-fit">
                  {item}
                </a>
              ))}
            </nav>
          </div>

          <div className="md:col-span-2 flex flex-col gap-6">
            <h4 className="text-[10px] font-black tracking-[0.2em] text-foreground uppercase">Légal</h4>
            <nav className="flex flex-col gap-4">
              {["À propos", "Confidentialité", "Contact"].map((item) => (
                <a key={item} href={`/${item.toLowerCase().replace(" ", "")}`} className="text-[12px] font-medium text-muted-foreground hover:text-primary transition-colors w-fit">
                  {item}
                </a>
              ))}
            </nav>
          </div>

          {/* Social & Localisation */}
          <div className="md:col-span-2 flex flex-col gap-6 items-start md:items-end">
             <h4 className="text-[10px] font-black tracking-[0.2em] text-foreground uppercase">Suivre</h4>
             <div className="flex gap-4">
                {[Facebook, Instagram, Twitter].map((Icon, i) => (
                  <a key={i} href="#" className="w-8 h-8 rounded-full border border-border/40 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white hover:border-primary transition-all duration-300">
                    <Icon size={14} />
                  </a>
                ))}
             </div>
          </div>
        </div>

        <Separator className="bg-border/40" />

        <div className="mt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold tracking-widest text-muted-foreground/50 uppercase">
              © {currentYear} TrackIt 
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground/80 uppercase">
              Suivi de commandes
            </span>
            <span className="text-[11px] font-serif italic text-foreground border-b border-primary/30">
              et livraisons
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}