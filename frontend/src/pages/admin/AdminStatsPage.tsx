import { useState } from "react";
import { 
  Calendar, TrendingUp, Download, PieChart as PieChartIcon, 
  BarChart3, LineChart as LineChartIcon 
} from "lucide-react";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import Button from "@/components/reusable/Button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- Mock Data ---

// 1. Evolution des commandes
const lineData = [
  { name: '10 Avr', commandes: 45, ca: 1200000 },
  { name: '11 Avr', commandes: 52, ca: 1350000 },
  { name: '12 Avr', commandes: 38, ca: 950000 },
  { name: '13 Avr', commandes: 65, ca: 1800000 },
  { name: '14 Avr', commandes: 48, ca: 1250000 },
  { name: '15 Avr', commandes: 70, ca: 2100000 },
  { name: '16 Avr', commandes: 85, ca: 2400000 },
];

// 2. Répartition par statut
const PIE_COLORS = ['#f59e0b', '#3b82f6', '#6366f1', '#a855f7', '#10b981', '#ef4444'];
const pieData = [
  { name: 'En attente', value: 12, color: PIE_COLORS[0] },
  { name: 'Confirmée', value: 8, color: PIE_COLORS[1] },
  { name: 'Assignée', value: 5, color: PIE_COLORS[2] },
  { name: 'En livraison', value: 15, color: PIE_COLORS[3] },
  { name: 'Livrée', value: 42, color: PIE_COLORS[4] },
  { name: 'Annulée', value: 3, color: PIE_COLORS[5] },
];

// 3. Top Vendeurs
const vendorData = [
  { name: 'Mada Création', commandes: 120, ca: 3500000 },
  { name: 'Saveurs Locales', commandes: 98, ca: 1800000 },
  { name: 'Essence Nature', commandes: 85, ca: 2100000 },
  { name: 'Vannerie du Sud', commandes: 45, ca: 900000 },
  { name: 'Tech Store', commandes: 30, ca: 4500000 },
];

// 4. Activité Livreurs
const deliveryData = [
  { name: 'Marc D.', courses: 45, rating: 4.8 },
  { name: 'Paul R.', courses: 38, rating: 4.5 },
  { name: 'Jean K.', courses: 32, rating: 4.9 },
  { name: 'Luc M.', courses: 28, rating: 4.2 },
  { name: 'Tojo R.', courses: 20, rating: 4.6 },
];

// --- Custom Tooltip ---
const CustomTooltip = ({ active, payload, label, suffix = "" }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border/40 p-3 rounded-xl shadow-lg">
        <p className="font-bold text-foreground mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm font-medium">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="text-foreground font-bold">
              {entry.name === 'CA' ? entry.value.toLocaleString('fr-FR') : entry.value} {entry.name === 'CA' ? 'Ar' : suffix}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminStatsPage() {
  const [periodFilter, setPeriodFilter] = useState("7d");

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Statistiques</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <BarChart3 className="text-primary" /> Statistiques de la plateforme
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-[160px] rounded-xl bg-card border-border/40 font-semibold h-10">
              <Calendar size={16} className="mr-2 text-muted-foreground" />
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="7d">7 derniers jours</SelectItem>
              <SelectItem value="30d">30 derniers jours</SelectItem>
              <SelectItem value="90d">3 derniers mois</SelectItem>
              <SelectItem value="1y">Cette année</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="rounded-xl h-10 gap-2 border-border/40">
            <Download size={16} /> Exporter
          </Button>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Evolution Line Chart */}
        <div className="lg:col-span-2 bg-card border border-border/40 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                <LineChartIcon size={18} className="text-muted-foreground" />
                Évolution des commandes
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Volume de commandes sur la période sélectionnée</p>
            </div>
            <div className="bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1">
              <TrendingUp size={14} /> +18.5%
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 500 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 500 }} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '13px', fontWeight: 600 }} />
                <Line 
                  type="monotone" 
                  name="Commandes"
                  dataKey="commandes" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: 'hsl(var(--background))' }}
                  activeDot={{ r: 6, strokeWidth: 0, fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Pie Chart */}
        <div className="lg:col-span-1 bg-card border border-border/40 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="mb-6">
            <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              <PieChartIcon size={18} className="text-muted-foreground" />
              Répartition par statut
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Sur l'ensemble des commandes</p>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center relative min-h-[250px]">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip suffix="commandes" />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-foreground">85</span>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Total</span>
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top Vendors Bar Chart */}
        <div className="bg-card border border-border/40 rounded-2xl p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              <TrendingUp size={18} className="text-amber-500" />
              Top 5 Vendeurs
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Par volume de commandes traitées</p>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vendorData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis 
                  type="number" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--foreground))', fontSize: 12, fontWeight: 600 }} 
                  width={100}
                />
                <Tooltip content={<CustomTooltip suffix="commandes" />} cursor={{ fill: 'hsl(var(--muted)/0.5)' }} />
                <Bar 
                  dataKey="commandes" 
                  name="Commandes"
                  fill="#f59e0b" // amber-500
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Delivery Bar Chart */}
        <div className="bg-card border border-border/40 rounded-2xl p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              <TrendingUp size={18} className="text-purple-500" />
              Activité des Livreurs
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Par nombre de courses complétées</p>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deliveryData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--foreground))', fontSize: 12, fontWeight: 600 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                />
                <Tooltip content={<CustomTooltip suffix="courses" />} cursor={{ fill: 'hsl(var(--muted)/0.5)' }} />
                <Bar 
                  dataKey="courses" 
                  name="Courses"
                  fill="#8b5cf6" // violet-500
                  radius={[4, 4, 0, 0]}
                  barSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
