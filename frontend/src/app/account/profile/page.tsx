'use client';

import { useEffect, useState } from 'react';
import { addressApi } from '@/lib/api';
import { Address } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import Spinner from '@/components/Spinner';
import {
  MapPin, Plus, Trash2, Check, X, User, Star,
} from 'lucide-react';

interface AddressForm {
  rue: string;
  ville: string;
  codePostal: string;
  pays: string;
  principal: boolean;
}

const emptyForm: AddressForm = { rue: '', ville: '', codePostal: '', pays: 'Tunisie', principal: false };

export default function ProfilePage() {
  const { user } = useAuth();
  const [addresses, setAddresses]   = useState<Address[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [form, setForm]             = useState<AddressForm>(emptyForm);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError]   = useState('');
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  const load = async () => {
    try {
      const res = await addressApi.getAll();
      setAddresses(res.data ?? []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.rue || !form.ville || !form.codePostal || !form.pays) {
      setFormError('Tous les champs sont obligatoires'); return;
    }
    setFormLoading(true);
    try {
      await addressApi.create(form);
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (e: any) { setFormError(e.response?.data?.message || 'Erreur'); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette adresse ?')) return;
    setDeleteLoading(id);
    try {
      await addressApi.delete(id);
      setAddresses(prev => prev.filter(a => a.id !== id));
    } catch (e: any) { alert(e.response?.data?.message || 'Erreur'); }
    finally { setDeleteLoading(null); }
  };

  const handleSetPrimary = async (id: number) => {
    try {
      await addressApi.setPrimary(id);
      setAddresses(prev => prev.map(a => ({ ...a, principal: a.id === id })));
    } catch (e: any) { alert(e.response?.data?.message || 'Erreur'); }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Spinner /></div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">

      {/* ── Personal info ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-white"/>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Mon profil</h1>
        </div>
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {user?.prenom?.[0]}{user?.nom?.[0]}
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">{user?.prenom} {user?.nom}</p>
            <p className="text-gray-500 text-sm mt-0.5">{user?.email}</p>
            <span className="mt-2 inline-block text-xs bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full font-medium">{user?.role}</span>
          </div>
        </div>
      </div>

      {/* ── Account nav ── */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl overflow-x-auto">
        {[
          { href: '/account/orders',  label: '📦 Mes commandes' },
          { href: '/account/profile', label: '👤 Profil & Adresses', active: true },
          { href: '/account/reviews', label: '⭐ Mes avis' },
        ].map(link => (
          <a key={link.href} href={link.href}
            className={`flex-1 text-center py-2.5 px-3 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              link.active ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}>
            {link.label}
          </a>
        ))}
      </div>

      {/* ── Addresses ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-green-600"/>
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Adresses de livraison</h2>
              <p className="text-xs text-gray-400">{addresses.length} adresse{addresses.length > 1 ? 's' : ''} enregistrée{addresses.length > 1 ? 's' : ''}</p>
            </div>
          </div>
          <button onClick={() => { setShowForm(!showForm); setForm(emptyForm); setFormError(''); }}
            className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4"/> Ajouter
          </button>
        </div>

        {/* Add form */}
        {showForm && (
          <div className="mb-6 bg-gray-50 border border-gray-200 rounded-xl p-5">
            <h3 className="font-semibold text-gray-800 mb-4 text-sm">Nouvelle adresse</h3>
            <form onSubmit={handleAdd} className="space-y-3">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">{formError}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rue <span className="text-red-500">*</span></label>
                <input className="input" placeholder="12, Rue de la Paix" required
                  value={form.rue} onChange={e => setForm(p => ({ ...p, rue: e.target.value }))}/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ville <span className="text-red-500">*</span></label>
                  <input className="input" placeholder="Tunis" required
                    value={form.ville} onChange={e => setForm(p => ({ ...p, ville: e.target.value }))}/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code postal <span className="text-red-500">*</span></label>
                  <input className="input" placeholder="1000" required
                    value={form.codePostal} onChange={e => setForm(p => ({ ...p, codePostal: e.target.value }))}/>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pays <span className="text-red-500">*</span></label>
                <input className="input" placeholder="Tunisie" required
                  value={form.pays} onChange={e => setForm(p => ({ ...p, pays: e.target.value }))}/>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded accent-primary"
                  checked={form.principal} onChange={e => setForm(p => ({ ...p, principal: e.target.checked }))}/>
                <span className="text-sm text-gray-700">Définir comme adresse principale</span>
              </label>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-xl text-sm font-medium hover:bg-gray-100">
                  Annuler
                </button>
                <button type="submit" disabled={formLoading}
                  className="flex-1 bg-primary text-white py-2 rounded-xl text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                  {formLoading ? 'Ajout...' : <><Check className="w-4 h-4"/> Ajouter</>}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Address list */}
        {addresses.length === 0 ? (
          <div className="text-center py-10">
            <MapPin className="w-12 h-12 text-gray-200 mx-auto mb-3"/>
            <p className="text-gray-400 text-sm">Aucune adresse enregistrée</p>
            <p className="text-gray-300 text-xs mt-1">Ajoutez votre première adresse de livraison</p>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map(addr => (
              <div key={addr.id}
                className={`rounded-xl border p-4 flex items-start gap-4 transition-colors ${
                  addr.principal ? 'border-primary bg-blue-50' : 'border-gray-100 bg-white hover:bg-gray-50'
                }`}>
                <MapPin className={`w-5 h-5 mt-0.5 flex-shrink-0 ${addr.principal ? 'text-primary' : 'text-gray-400'}`}/>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900">{addr.rue}</p>
                    {addr.principal && (
                      <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                        <Star className="w-2.5 h-2.5"/> Principale
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{addr.ville}, {addr.codePostal}</p>
                  <p className="text-sm text-gray-400">{addr.pays}</p>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {!addr.principal && (
                    <button onClick={() => handleSetPrimary(addr.id)}
                      className="text-xs text-primary border border-primary/30 px-2 py-1 rounded-lg hover:bg-primary/10 font-medium whitespace-nowrap">
                      Définir principale
                    </button>
                  )}
                  <button onClick={() => handleDelete(addr.id)} disabled={deleteLoading === addr.id}
                    className="flex items-center justify-center gap-1 text-xs text-red-500 border border-red-200 px-2 py-1 rounded-lg hover:bg-red-50 font-medium disabled:opacity-50">
                    {deleteLoading === addr.id ? '...' : <><Trash2 className="w-3 h-3"/> Supprimer</>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
