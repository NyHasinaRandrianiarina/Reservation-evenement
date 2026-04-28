import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, Download, CalendarPlus, ArrowRight } from 'lucide-react';
import { useRegistrationStore } from '@/stores/useRegistrationStore';
import { useEvent } from '@/hooks/useEvents';
import { Button } from '@/components/ui/button';
import { TicketPrintable } from '@/components/tickets/TicketPrintable';
import { downloadTicketPdf } from '@/utils/download-ticket';

export default function ConfirmationPage() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { data: event } = useEvent(slug || '');
  const { contact, clearRegistration } = useRegistrationStore();
  const printRef = useRef<HTMLDivElement>(null);

  const [orderNumber] = useState(() => Math.floor(Math.random() * 1000000));

  const ticketId = useMemo(() => `EVT-${orderNumber}`, [orderNumber]);
  const attendeeName = useMemo(() => {
    const first = contact?.firstName?.trim() ?? '';
    const last = contact?.lastName?.trim() ?? '';
    const full = `${first} ${last}`.trim();
    return full || undefined;
  }, [contact?.firstName, contact?.lastName]);

  useEffect(() => {
    // In a real app, we might clear the registration store when they leave the page
    // return () => clearRegistration();
  }, []);

  if (!event) return null;

  return (
    <div className="max-w-3xl mx-auto py-12 md:py-24 px-6 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
        className="flex justify-center mb-8"
      >
        <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center relative">
          <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-ping opacity-20" />
          <CheckCircle2 className="w-12 h-12 text-primary" />
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <h1 className="text-4xl md:text-5xl font-serif font-light mb-4">Inscription confirmée !</h1>
        <p className="text-muted-foreground text-lg max-w-lg mx-auto mb-12">
          Un email de confirmation contenant vos billets a été envoyé à
          <strong className="text-foreground ml-1">{contact?.email || 'votre adresse email'}</strong>.
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="glass rounded-[2.5rem] p-8 md:p-12 border border-border shadow-2xl text-left mb-12"
      >
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center mb-8 pb-8 border-b border-border/40">
          <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 hidden md:block">
            <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-2">{event.title}</h3>
            <p className="text-muted-foreground">
              N° de commande : <span className="font-mono text-foreground font-medium">#EVT-{orderNumber}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="h-14 rounded-2xl gap-3"
            onClick={async () => {
              if (!printRef.current) return;
              await downloadTicketPdf({
                element: printRef.current,
                filename: `billet-${ticketId}.pdf`,
              });
            }}
          >
            <Download className="w-5 h-5" />
            Télécharger les billets
          </Button>
          <Button variant="outline" className="h-14 rounded-2xl gap-3">
            <CalendarPlus className="w-5 h-5" />
            Ajouter au calendrier
          </Button>
        </div>
      </motion.div>

      <div className="fixed left-[-10000px] top-0 opacity-0 pointer-events-none">
        <TicketPrintable
          ref={printRef}
          eventTitle={event.title}
          eventImage={event.coverImage}
          date={new Date(event.startDate).toLocaleString()}
          location={
            event.location?.type === 'online'
              ? 'En ligne'
              : String(event.location?.address ?? event.location?.city ?? 'Lieu à confirmer')
          }
          ticketType="Billet"
          quantity={1}
          ticketId={ticketId}
          attendeeName={attendeeName}
        />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <Button
          variant="link"
          className="text-muted-foreground hover:text-foreground gap-2"
          onClick={() => {
            clearRegistration();
            navigate('/events');
          }}
        >
          Retour au catalogue <ArrowRight className="w-4 h-4" />
        </Button>
      </motion.div>
    </div>
  );
}
