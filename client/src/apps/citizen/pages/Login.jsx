import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCitizenAuth } from '../../../context/CitizenAuthContext';
import Button from '../../../components/Button';
import { Field, Input } from '../../../components/Input';
import Card from '../../../components/Card';

export default function Login() {
  const { requestOtp, verifyOtp } = useCitizenAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRequestOtp(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await requestOtp(phone);
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send the code. Check the number and try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verifyOtp(phone, otp, name);
      navigate('/report');
    } catch (err) {
      setError(err.response?.data?.message || 'That code didn\u2019t match. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <h1 className="mb-1 text-2xl font-semibold">Report a civic issue</h1>
        <p className="mb-6 text-sm text-ink/60">
          {step === 'phone'
            ? 'Enter your phone number to get started.'
            : `Enter the code sent to ${phone}.`}
        </p>

        {step === 'phone' ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <Field label="Phone number" htmlFor="phone">
              <Input
                id="phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </Field>
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button type="submit" loading={loading} className="w-full">
              Send code
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <Field label="Your name" hint="Used on your complaint history">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
            </Field>
            <Field label="6-digit code" htmlFor="otp">
              <Input
                id="otp"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="font-mono tracking-widest"
                required
              />
            </Field>
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button type="submit" loading={loading} className="w-full">
              Verify and continue
            </Button>
            <button
              type="button"
              onClick={() => setStep('phone')}
              className="w-full text-center text-sm text-ink/60 hover:text-ink"
            >
              Use a different number
            </button>
          </form>
        )}
      </Card>
    </div>
  );
}
