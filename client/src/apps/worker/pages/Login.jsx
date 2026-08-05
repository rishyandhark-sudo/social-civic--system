import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkerAuth } from '../../../context/WorkerAuthContext';
import Button from '../../../components/Button';
import { Field, Input } from '../../../components/Input';
import Card from '../../../components/Card';

export default function Login() {
  const { login } = useWorkerAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/worker/tasks');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <h1 className="mb-1 text-2xl font-semibold">Field worker sign in</h1>
        <p className="mb-6 text-sm text-ink/60">View and complete your assigned tasks.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Email" htmlFor="email">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </Field>
          <Field label="Password" htmlFor="password">
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </Field>
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" loading={loading} className="w-full">
            Sign in
          </Button>
        </form>
      </Card>
    </div>
  );
}
