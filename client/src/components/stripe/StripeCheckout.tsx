import { useState } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button, LoadingSpinner } from '@/components/ui';
import { paymentService } from '@/services/paymentService';
import toast from 'react-hot-toast';

const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey && !stripeKey.includes('placeholder')
  ? loadStripe(stripeKey)
  : null;

function CheckoutForm({ bookingId, amount, onSuccess, onClose }: { bookingId: string; amount: number; onSuccess: () => void; onClose: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      toast.error(error.message || 'Pagesa dështoi');
      setProcessing(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      try {
        await paymentService.confirmPayment(bookingId, 'card');
        toast.success('Pagesa u krye me sukses!');
        onSuccess();
      } catch {
        toast.error('Rezervimi u krye por konfirmimi dështoi. Kontakto pronarin.');
      }
    }
    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {processing ? (
        <div className="flex justify-center py-4"><LoadingSpinner size="sm" /></div>
      ) : (
        <div className="flex gap-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Anulo</Button>
          <Button type="submit" className="flex-1" disabled={!stripe}>Paguaj {amount}€</Button>
        </div>
      )}
    </form>
  );
}

interface Props {
  bookingId: string;
  amount: number;
  clientSecret: string | null;
  testMode?: boolean;
  onSuccess: () => void;
  onClose: () => void;
}

export default function StripeCheckout({ bookingId, amount, clientSecret, testMode, onSuccess, onClose }: Props) {
  const [paid, setPaid] = useState(false);

  if (testMode || !clientSecret) {
    return (
      <div className="space-y-4 p-4 bg-yellow-50 rounded-xl text-sm text-center">
        <p className="font-semibold text-yellow-700">Stripe nuk është konfiguruar ende</p>
        <p className="text-yellow-600">Pagesa do të bëhet me para në dorë te pronari.</p>
        <Button onClick={onSuccess}>Vazhdo</Button>
      </div>
    );
  }

  if (paid) return null;

  if (!stripePromise) {
    return (
      <div className="space-y-4 p-4 bg-yellow-50 rounded-xl text-sm text-center">
        <p className="text-yellow-700">Paguaj me para në dorë te pronari</p>
        <Button onClick={onSuccess}>Konfirmo</Button>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm bookingId={bookingId} amount={amount} onSuccess={() => { setPaid(true); onSuccess(); }} onClose={onClose} />
    </Elements>
  );
}
