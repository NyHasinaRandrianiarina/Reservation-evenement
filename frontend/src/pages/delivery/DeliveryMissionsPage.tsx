import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  MapPin, Clock, Search, ArrowRight, Map
} from "lucide-react";
import Button from "@/components/reusable/Button";
import Input from "@/components/reusable/Input";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { toast } from "react-hot-toast";
import { MOCK_ORDERS } from "@/data/mockData";

export default function DeliveryMissionsPage() {
  const [activeTab, setActiveTab] = useState("available");
  const [searchTerm, setSearchTerm] = useState("");

  // Derive missions from mocks
  const [missions, setMissions] = useState(MOCK_ORDERS);

  const handleAcceptMission = (id: string) => {
    setMissions(missions.map(m => 
      m.id === id ? { ...m, status: 'ASSIGNED' as const } : m
    ));
    toast.success("Mission acceptée ! En route pour le pick-up.");
  };

  const filteredMissions = missions.filter(m => {
    // Tab Filter
    if (activeTab === "available" && m.status !== 'CONFIRMED') return false;
    if (activeTab === "my-missions" && !['ASSIGNED', 'IN_TRANSIT'].includes(m.status)) return false;

    // Search Filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return m.id.toLowerCase().includes(term) || m.seller.name.toLowerCase().includes(term);
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/delivery/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Mes Missions</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight text-foreground">
          Mes Missions
        </h1>
        <p className="text-muted-foreground">Trouvez des livraisons à proximité ou suivez vos missions en cours.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 w-full">
           <Input 
            placeholder="Rechercher par quartier ou boutique..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search size={18} className="text-muted-foreground" />}
            className="bg-muted/50 border-transparent focus:border-primary/50 h-12"
          />
        </div>
        
        {/* Custom Tabs */}
        <div className="bg-card border border-border/40 p-1 rounded-xl flex gap-1 w-full md:w-auto">
          {[
            { id: "available", label: "Disponibles" },
            { id: "my-missions", label: "En cours" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 md:w-32 px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === tab.id 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              {tab.label}
              <Badge variant="secondary" className={`ml-1 ${activeTab === tab.id ? "bg-white/20 text-white" : "bg-muted"}`}>
                 {missions.filter(m => tab.id === "available" ? m.status === 'CONFIRMED' : ['ASSIGNED', 'IN_TRANSIT'].includes(m.status)).length}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredMissions.length === 0 ? (
          <div className="lg:col-span-2 py-20 text-center flex flex-col items-center justify-center bg-card rounded-2xl border border-border/40 border-dashed">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Map size={24} className="text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Aucune mission</h3>
            <p className="text-muted-foreground max-w-sm mt-2">Nous n'avons trouvé aucune mission pour le moment dans cette catégorie.</p>
          </div>
        ) : (
          filteredMissions.map((mission, i) => (
            <div key={mission.id} className={`bg-card border rounded-2xl p-6 shadow-sm flex flex-col gap-6 transition-all ${activeTab === 'my-missions' ? 'border-primary/30 ring-1 ring-primary/10' : 'border-border/40 hover:border-primary/30'}`}>
              
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-foreground bg-muted px-2 py-0.5 rounded">#{mission.id}</span>
                    <Badge className="bg-primary/10 text-primary border-none font-black tracking-tight">
                       5 000 Ar
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                     <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                       <MapPin size={12} /> ~ 2.5 km
                     </span>
                     <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                       <Clock size={12} /> {15 + i * 2} min
                     </span>
                  </div>
                </div>
                {mission.status === 'IN_TRANSIT' && (
                   <Badge className="bg-emerald-500 text-white animate-pulse">En livraison</Badge>
                )}
              </div>

              <div className="relative pl-6 space-y-6 before:absolute before:inset-y-1 before:left-[11px] before:w-[1.5px] before:bg-border before:border-dashed">
                <div className="relative">
                   <div className="absolute -left-[23px] w-4 h-4 rounded-full bg-amber-500 ring-4 ring-card" />
                   <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pick-up</span>
                      <span className="text-sm font-bold text-foreground">{mission.seller.name}</span>
                      <span className="text-xs text-muted-foreground">{mission.seller.address}</span>
                   </div>
                </div>
                <div className="relative">
                   <div className="absolute -left-[23px] w-4 h-4 rounded-full bg-primary ring-4 ring-card" />
                   <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Livraison</span>
                      <span className="text-sm font-bold text-foreground">Sarah M.</span>
                      <span className="text-xs text-muted-foreground">{mission.shippingAddress.address}, {mission.shippingAddress.city}</span>
                   </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border/40 flex items-center justify-between">
                {activeTab === 'available' ? (
                   <Button 
                    onClick={() => handleAcceptMission(mission.id)}
                    variant="primary" 
                    className="w-full rounded-xl font-bold h-11 shadow-sm"
                  >
                    Accepter la mission
                  </Button>
                ) : (
                  <Link to={`/delivery/missions/${mission.id}`} className="w-full">
                    <Button variant="outline" className="w-full rounded-xl font-bold h-11 border-primary/20 text-primary hover:bg-primary/5 group">
                       Détails & Suivi <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                )}
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}
