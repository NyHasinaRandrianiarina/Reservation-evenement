import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { getOrganizerEventById } from '@/api/events';
import { useEventWizardStore } from "@/store/useEventWizardStore";

import Step1GeneralInfo from "./wizard/Step1GeneralInfo";
import Step2Ticketing from "./wizard/Step2Ticketing";
import Step3FormBuilder from "./wizard/Step3FormBuilder";
import Step4Publish from "./wizard/Step4Publish";

const steps = [
  { id: 1, name: "Infos générales" },
  { id: 2, name: "Billetterie" },
  { id: 3, name: "Formulaire" },
  { id: 4, name: "Récapitulatif" },
];

export default function EventWizardPage() {
  const { id } = useParams<{ id: string }>();
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  const { updateDraft, resetDraft } = useEventWizardStore();

  const { data: eventData, isLoading } = useQuery({
    queryKey: ['organizer', 'event', id],
    queryFn: () => getOrganizerEventById(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (id && eventData) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const e = eventData as any;
      updateDraft({
        title: e.title,
        category: e.category,
        description: e.description,
        startDate: (() => { try { return e.startDate ? new Date(e.startDate).toISOString().slice(0, 16) : "" } catch { return "" } })(),
        endDate: (() => { try { return e.endDate ? new Date(e.endDate).toISOString().slice(0, 16) : "" } catch { return "" } })(),
        location: e.location || { type: "in_person", address: "" },
        capacity: e.capacity,
        isPrivate: !e.isPublic,
        coverImageUrl: e.coverImage || undefined,
        tickets: e.ticketTypes ? e.ticketTypes.map((t: any) => ({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          id: t.id,
          name: t.name,
          type: t.price > 0 ? "paid" : "free",
          price: t.price,
          quota: t.quota,
          description: t.description || "",
          limitPerOrder: t.maxPerOrder || 10,
        })) : [],
        customFields: e.customFields || [],
      });
    } else if (!id) {
      resetDraft();
    }
  }, [id, eventData, updateDraft, resetDraft]);

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header / Stepper */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/organizer/dashboard")}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-lg font-semibold hidden sm:block">
            {id ? "Modifier l'événement" : "Créer un événement"}
          </h1>
        </div>

        {/* Stepper */}
        <nav aria-label="Progress">
          <ol role="list" className="flex items-center">
            {steps.map((step, stepIdx) => (
              <li key={step.name} className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
                <div className="flex items-center">
                  <div 
                    className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 
                      ${currentStep > step.id ? 'border-primary bg-primary text-primary-foreground' : 
                        currentStep === step.id ? 'border-primary border-2 text-primary' : 
                        'border-muted bg-muted text-muted-foreground'}`}
                  >
                    {currentStep > step.id ? (
                      <Check className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <span className="text-xs font-semibold">{step.id}</span>
                    )}
                  </div>
                  {stepIdx !== steps.length - 1 ? (
                    <div className="absolute top-4 w-full -translate-y-1/2 left-8 sm:left-10 h-0.5 sm:w-16">
                      <div className={`h-0.5 w-full ${currentStep > step.id ? 'bg-primary' : 'bg-muted'}`} />
                    </div>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-card border border-border shadow-sm rounded-2xl p-6 sm:p-8 min-h-[60vh]">
          {isLoading ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground animate-pulse">
              Chargement des données de l'événement...
            </div>
          ) : (
            <>
              {currentStep === 1 && <Step1GeneralInfo onNext={handleNext} />}
              {currentStep === 2 && <Step2Ticketing onNext={handleNext} onPrev={handlePrev} />}
              {currentStep === 3 && <Step3FormBuilder onNext={handleNext} onPrev={handlePrev} />}
              {currentStep === 4 && <Step4Publish onPrev={handlePrev} />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
