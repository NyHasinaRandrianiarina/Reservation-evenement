import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, MapPin, CalendarDays, Ticket } from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import type { RegistrationItem } from './RegistrationCard';
import { useRef } from 'react';
import { TicketPrintable } from '@/components/tickets/TicketPrintable';
import { downloadTicketPdf } from '@/utils/download-ticket';

import QRCode from 'react-qr-code';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: RegistrationItem;
}

export default function TicketModal({ isOpen, onClose, registration }: TicketModalProps) {
  if (!registration) return null;
  const printRef = useRef<HTMLDivElement>(null);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-background border-border rounded-3xl">
        <VisuallyHidden>
          <DialogTitle>Billet de {registration.eventTitle}</DialogTitle>
          <DialogDescription>Détails de votre billet pour l'événement {registration.eventTitle}</DialogDescription>
        </VisuallyHidden>
        <div className="relative h-32 bg-muted">
          <img
            src={registration.eventImage}
            alt={registration.eventTitle}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-linear-to-t from-background to-transparent" />
        </div>

        <div className="px-6 pb-6 pt-2 relative -mt-8 z-10">
          <div className="bg-card border border-border shadow-2xl rounded-2xl p-6 relative overflow-hidden">
            {/* The "hole" punches for ticket effect */}
            <div className="absolute top-1/2 -left-3 w-6 h-6 bg-background rounded-full -translate-y-1/2 border-r border-border" />
            <div className="absolute top-1/2 -right-3 w-6 h-6 bg-background rounded-full -translate-y-1/2 border-l border-border" />

            <div className="border-b border-dashed border-border pb-6 mb-6">
              <h2 className="text-xl font-bold font-serif mb-4 leading-tight">{registration.eventTitle}</h2>

              <div className="space-y-3">
                <div className="flex items-start gap-3 text-sm text-muted-foreground">
                  <CalendarDays className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{registration.date}</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{registration.location}</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-muted-foreground">
                  <Ticket className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{registration.ticketType} (x{registration.quantity})</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center pt-2">
              <div className="w-40 h-40 bg-white rounded-xl p-4 flex items-center justify-center mb-4">
                <QRCode
                  value={registration.id}
                  size={128}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  viewBox={`0 0 256 256`}
                />
              </div>
              <span className="font-mono text-sm tracking-[0.2em] font-semibold">
                #{registration.id}
              </span>
              <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-widest text-center">
                À présenter à l'entrée
              </p>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button variant="outline" className="w-full rounded-2xl h-12" onClick={onClose}>
              Fermer
            </Button>
            <Button
              className="w-full rounded-2xl h-12 gap-2 shadow-lg shadow-primary/20"
              onClick={async () => {
                if (!printRef.current) return;
                await downloadTicketPdf({
                  element: printRef.current,
                  filename: `billet-${registration.id}.pdf`,
                });
              }}
            >
              <Download className="w-4 h-4" />
              PDF
            </Button>
          </div>

          <div className="fixed left-[-10000px] top-0 opacity-0 pointer-events-none">
            <TicketPrintable
              ref={printRef}
              eventTitle={registration.eventTitle}
              eventImage={registration.eventImage}
              date={registration.date}
              location={registration.location}
              ticketType={registration.ticketType}
              quantity={registration.quantity}
              ticketId={registration.id}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
