import { forwardRef } from "react";
import QRCode from "react-qr-code";
import { CalendarDays, MapPin, Ticket as TicketIcon } from "lucide-react";

export type TicketPrintableProps = {
  eventTitle: string;
  eventImage: string;
  date: string;
  location: string;
  ticketType: string;
  quantity: number;
  ticketId: string;
  attendeeName?: string;
};

export const TicketPrintable = forwardRef<HTMLDivElement, TicketPrintableProps>(
  ({ eventTitle, eventImage, date, location, ticketType, quantity, ticketId, attendeeName }, ref) => {
    return (
      <div ref={ref} className="w-[820px] bg-[#ffffff] text-[#0a0a0a]">
        <div className="rounded-[28px] overflow-hidden border border-[#e5e7eb]">
          <div className="relative h-44 bg-[#f4f4f5]">
            <img src={eventImage} alt={eventTitle} className="w-full h-full object-cover opacity-70" />
            <div className="absolute inset-0 bg-linear-to-t from-white via-white/40 to-transparent" />
            <div className="absolute left-8 bottom-6 right-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#ffffff]/80 backdrop-blur px-4 py-2 border border-[#e5e7eb]">
                <TicketIcon className="w-4 h-4 text-[#4f46e5]" />
                <span className="text-xs font-semibold uppercase tracking-widest">Billet officiel</span>
              </div>
              <h1 className="mt-4 text-3xl font-serif font-semibold leading-tight text-[#0a0a0a]">
                {eventTitle}
              </h1>
              {attendeeName ? (
                <p className="mt-2 text-sm text-[#52525b]">
                  Participant : <span className="text-[#0a0a0a] font-medium">{attendeeName}</span>
                </p>
              ) : null}
            </div>
          </div>

          <div className="bg-[#ffffff] p-8 relative">
            <div className="absolute top-1/2 -left-4 w-8 h-8 bg-[#ffffff] rounded-full -translate-y-1/2 border-r border-[#e5e7eb]" />
            <div className="absolute top-1/2 -right-4 w-8 h-8 bg-[#ffffff] rounded-full -translate-y-1/2 border-l border-[#e5e7eb]" />

            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-7">
                <div className="rounded-2xl border border-[#e5e7eb] bg-[#ffffff] p-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CalendarDays className="w-5 h-5 text-[#4f46e5] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-[#71717a]">Date</p>
                        <p className="text-sm font-medium">{date}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-[#4f46e5] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-[#71717a]">Lieu</p>
                        <p className="text-sm font-medium">{location}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <TicketIcon className="w-5 h-5 text-[#4f46e5] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-[#71717a]">Type</p>
                        <p className="text-sm font-medium">
                          {ticketType} <span className="text-[#71717a]">× {quantity}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-dashed border-[#e5e7eb]">
                    <p className="text-[11px] text-[#52525b] leading-relaxed">
                      Présentez ce billet (imprimé ou sur mobile) à l’entrée. Toute reproduction est interdite.
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-span-5">
                <div className="rounded-2xl border border-[#e5e7eb] bg-[#ffffff] p-6 flex flex-col items-center justify-center">
                  <div className="w-52 h-52 bg-[#ffffff] rounded-2xl p-5 flex items-center justify-center">
                    <QRCode
                      value={ticketId}
                      size={160}
                      style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                      viewBox="0 0 256 256"
                    />
                  </div>
                  <div className="mt-5 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#71717a]">
                      Code billet
                    </p>
                    <p className="mt-2 font-mono text-sm tracking-[0.22em] font-semibold">#{ticketId}</p>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-[#e5e7eb] bg-[#fafafa] p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#71717a]">Aide</p>
                  <p className="mt-2 text-xs text-[#52525b] leading-relaxed">
                    Si le QR code ne scanne pas, communiquez le code billet au staff.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

TicketPrintable.displayName = "TicketPrintable";
