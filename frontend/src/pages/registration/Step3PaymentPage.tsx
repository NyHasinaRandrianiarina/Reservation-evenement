import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import OrderSummary from './components/OrderSummary';

export default function Step3PaymentPage() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [isProcessing, setIsProcessing] = useState(false);

  // In a real scenario, you would fetch the payment intent here
  // const { contact } = useRegistrationStore();

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      navigate(`/events/${slug}/confirmation`);
    }, 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      <div className="lg:col-span-7 xl:col-span-8">
        <Button 
          variant="ghost" 
          className="mb-6 -ml-3 text-muted-foreground hover:text-foreground"
          onClick={() => navigate(`/events/${slug}/register/info`)}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Retour aux informations
        </Button>

        <h2 className="text-3xl font-serif italic mb-8">Paiement</h2>

        <div className="p-8 rounded-4xl border border-border bg-card shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
             <Lock className="w-32 h-32" />
          </div>

          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Paiement sécurisé (Mock)
          </h3>
          
          <div className="space-y-6 max-w-md relative z-10">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Numéro de carte</label>
              <Input 
                className="h-12 rounded-2xl font-mono text-lg bg-muted/50"
                placeholder="4242 4242 4242 4242"
                disabled={isProcessing}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Expiration</label>
                <Input 
                  className="h-12 rounded-2xl font-mono text-lg bg-muted/50"
                  placeholder="MM/AA"
                  disabled={isProcessing}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">CVC</label>
                <Input 
                  className="h-12 rounded-2xl font-mono text-lg bg-muted/50"
                  placeholder="123"
                  type="password"
                  disabled={isProcessing}
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
              En confirmant votre commande, vous acceptez les conditions générales de vente. Ce formulaire est une simulation (Mock).
            </p>
          </div>
        </div>
      </div>

      <div className="lg:col-span-5 xl:col-span-4">
        <OrderSummary 
          onContinue={handlePayment}
          continueLabel="Confirmer et payer"
          isLoading={isProcessing}
          isFinal={false} // So it renders the continue button
        />
      </div>
    </div>
  );
}
