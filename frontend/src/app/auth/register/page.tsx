'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    email: '', motDePasse: '', prenom: '', nom: '',
    role: 'CUSTOMER' as 'CUSTOMER' | 'SELLER',
    nomBoutique: '', descriptionBoutique: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.motDePasse.length < 8) return setError('Le mot de passe doit contenir au moins 8 caractères');
    setLoading(true);
    try {
      await register(form);
      // redirect is handled by AuthContext
    } catch (e: any) {
      if (!e.response) {
        setError('Impossible de contacter le serveur. Vérifiez que le backend est démarré.');
      } else {
        setError(e.response?.data?.message || "Erreur lors de l'inscription");
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Shop<span className="text-accent">Flow</span></h1>
          <p className="text-gray-500 mt-2">Créer votre compte</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Account type toggle */}
          <div className="flex rounded-xl overflow-hidden border border-gray-200">
            {(['CUSTOMER', 'SELLER'] as const).map(r => (
              <button key={r} type="button" onClick={() => setForm(p => ({ ...p, role: r }))}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${form.role === r ? 'bg-primary text-white' : 'hover:bg-gray-50 text-gray-600'}`}>
                {r === 'CUSTOMER' ? '🛒 Client' : '🏪 Vendeur'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              <input className="input" required placeholder="Alice"
                value={form.prenom} onChange={e => setForm(p => ({ ...p, prenom: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input className="input" required placeholder="Dupont"
                value={form.nom} onChange={e => setForm(p => ({ ...p, nom: e.target.value }))} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input className="input" type="email" required placeholder="votre@email.com"
              value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input className="input" type="password" required placeholder="8 caractères minimum"
              value={form.motDePasse} onChange={e => setForm(p => ({ ...p, motDePasse: e.target.value }))} />
          </div>

          {form.role === 'SELLER' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la boutique *</label>
                <input className="input" required={form.role === 'SELLER'} placeholder="Ma Super Boutique"
                  value={form.nomBoutique} onChange={e => setForm(p => ({ ...p, nomBoutique: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea className="input" rows={3} placeholder="Décrivez votre boutique..."
                  value={form.descriptionBoutique} onChange={e => setForm(p => ({ ...p, descriptionBoutique: e.target.value }))} />
              </div>
            </>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Inscription...' : 'Créer mon compte'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-500">
          Déjà un compte ?{' '}
          <Link href="/auth/login" className="text-primary font-medium hover:underline">Se connecter</Link>
        </div>
      </div>
    </div>
  );
}
