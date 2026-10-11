'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', motDePasse: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.motDePasse);
      // redirect handled by AuthContext (dashboard for seller/admin, home for customer)
    } catch (e: any) {
      if (!e.response) {
        setError('Impossible de contacter le serveur. Vérifiez que le backend est démarré sur le port 8081.');
      } else {
        setError(e.response?.data?.message || 'Email ou mot de passe incorrect');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Shop<span className="text-accent">Flow</span></h1>
          <p className="text-gray-500 mt-2">Connectez-vous à votre compte</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input className="input" type="email" required placeholder="votre@email.com"
              value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input className="input" type="password" required placeholder="••••••••"
              value={form.motDePasse} onChange={e => setForm(p => ({ ...p, motDePasse: e.target.value }))} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-500">
          Pas encore de compte ?{' '}
          <Link href="/auth/register" className="text-primary font-medium hover:underline">S'inscrire</Link>
        </div>

        <div className="mt-6 border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-400 text-center mb-2">Comptes de démonstration :</p>
          <div className="space-y-1 text-xs text-gray-500">
            <p><strong>Admin :</strong> admin@shopflow.com / password123</p>
            <p><strong>Vendeur :</strong> seller@shopflow.com / password123</p>
            <p><strong>Client :</strong> client@shopflow.com / password123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
