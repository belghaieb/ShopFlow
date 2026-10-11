'use client';

import { useEffect, useState } from 'react';
import { userAdminApi, categoryApi, couponApi, reviewApi, dashboardApi } from '@/lib/api';
import { UserAdmin, Category, Coupon, Review, DashboardAdmin } from '@/lib/types';
import Spinner from '@/components/Spinner';
import {
  Users, Tag, Ticket, Star, TrendingUp, ShoppingBag, Clock,
  UserCheck, UserX, Plus, Trash2, Check, X, ChevronDown, ChevronUp,
  BarChart2, Shield,
} from 'lucide-react';

type Tab = 'stats' | 'users' | 'categories' | 'coupons' | 'reviews';

const ROLE_COLORS: Record<string, string> = {
  ADMIN:    'bg-purple-100 text-purple-700',
  SELLER:   'bg-blue-100 text-blue-700',
  CUSTOMER: 'bg-green-100 text-green-700',
};

/* ───────── helpers ───────── */
const flatCats = (cats: Category[]): Category[] => {
  const r: Category[] = [];
  const go = (list: Category[]) =>
    list.forEach(c => { r.push(c); if (c.sousCategories?.length) go(c.sousCategories); });
  go(cats);
  return r;
};

export default function AdminDashboardPage() {
  const [tab, setTab] = useState<Tab>('stats');
  const [loading, setLoading] = useState(true);

  /* stats */
  const [stats, setStats] = useState<DashboardAdmin | null>(null);

  /* users */
  const [users, setUsers] = useState<UserAdmin[]>([]);
  const [userLoading, setUserLoading] = useState(false);

  /* categories */
  const [categories, setCategories] = useState<Category[]>([]);
  const [catFlat, setCatFlat] = useState<Category[]>([]);
  const [catForm, setCatForm] = useState({ nom: '', description: '', parentId: '' });
  const [catLoading, setCatLoading] = useState(false);
  const [catError, setCatError] = useState('');
  const [showCatForm, setShowCatForm] = useState(false);

  /* coupons */
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponForm, setCouponForm] = useState({ code: '', type: 'PERCENT', valeur: '', dateExpiration: '', usagesMax: '' });
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [showCouponForm, setShowCouponForm] = useState(false);

  /* reviews */
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewLoading, setReviewLoading] = useState<number | null>(null);

  /* expanded rows */
  const [expandedUser, setExpandedUser] = useState<number | null>(null);

  /* ── initial load ── */
  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, catsRes, couponsRes, reviewsRes] = await Promise.all([
        dashboardApi.admin(),
        userAdminApi.getAll({ size: 100 }),
        categoryApi.getAll(),
        couponApi.getAll(),
        reviewApi.getPending(),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data?.content ?? usersRes.data ?? []);
      const cats: Category[] = catsRes.data;
      setCategories(cats);
      setCatFlat(flatCats(cats));
      setCoupons(couponsRes.data?.content ?? couponsRes.data ?? []);
      setReviews(reviewsRes.data?.content ?? reviewsRes.data ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  /* ── user actions ── */
  const toggleUser = async (u: UserAdmin) => {
    setUserLoading(true);
    try {
      if (u.actif) await userAdminApi.deactivate(u.userId);
      else          await userAdminApi.activate(u.userId);
      setUsers(prev => prev.map(x => x.userId === u.userId ? { ...x, actif: !x.actif } : x));
    } catch (e: any) { alert(e.response?.data?.message || 'Erreur'); }
    finally { setUserLoading(false); }
  };

  /* ── category actions ── */
  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCatError('');
    if (!catForm.nom.trim()) { setCatError('Le nom est obligatoire'); return; }
    setCatLoading(true);
    try {
      await categoryApi.create(
        catForm.nom,
        catForm.description || undefined,
        catForm.parentId ? parseInt(catForm.parentId) : undefined,
      );
      setCatForm({ nom: '', description: '', parentId: '' });
      setShowCatForm(false);
      const res = await categoryApi.getAll();
      setCategories(res.data);
      setCatFlat(flatCats(res.data));
    } catch (e: any) { setCatError(e.response?.data?.message || 'Erreur'); }
    finally { setCatLoading(false); }
  };

  const deleteCategory = async (id: number) => {
    if (!confirm('Supprimer cette catégorie ?')) return;
    try {
      await categoryApi.delete(id);
      const res = await categoryApi.getAll();
      setCategories(res.data);
      setCatFlat(flatCats(res.data));
    } catch (e: any) { alert(e.response?.data?.message || 'Erreur'); }
  };

  /* ── coupon actions ── */
  const addCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (!couponForm.code || !couponForm.valeur) { setCouponError('Code et valeur obligatoires'); return; }
    setCouponLoading(true);
    try {
      await couponApi.create({
        code: couponForm.code.toUpperCase(),
        type: couponForm.type,
        valeur: parseFloat(couponForm.valeur),
        dateExpiration: couponForm.dateExpiration || null,
        usagesMax: couponForm.usagesMax ? parseInt(couponForm.usagesMax) : null,
      });
      setCouponForm({ code: '', type: 'PERCENT', valeur: '', dateExpiration: '', usagesMax: '' });
      setShowCouponForm(false);
      const res = await couponApi.getAll();
      setCoupons(res.data?.content ?? res.data ?? []);
    } catch (e: any) { setCouponError(e.response?.data?.message || 'Erreur'); }
    finally { setCouponLoading(false); }
  };

  const deleteCoupon = async (id: number) => {
    if (!confirm('Supprimer ce coupon ?')) return;
    try {
      await couponApi.delete(id);
      setCoupons(prev => prev.filter(c => c.id !== id));
    } catch (e: any) { alert(e.response?.data?.message || 'Erreur'); }
  };

  /* ── review actions ── */
  const approveReview = async (id: number) => {
    setReviewLoading(id);
    try {
      await reviewApi.approve(id);
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch (e: any) { alert(e.response?.data?.message || 'Erreur'); }
    finally { setReviewLoading(null); }
  };

  const deleteReview = async (id: number) => {
    setReviewLoading(id);
    try {
      await reviewApi.delete(id);
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch (e: any) { alert(e.response?.data?.message || 'Erreur'); }
    finally { setReviewLoading(null); }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Spinner /></div>
  );

  const TABS: { id: Tab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'stats',      label: 'Statistiques',   icon: BarChart2 },
    { id: 'users',      label: 'Utilisateurs',    icon: Users,  badge: users.length },
    { id: 'categories', label: 'Catégories',      icon: Tag,    badge: catFlat.length },
    { id: 'coupons',    label: 'Coupons',          icon: Ticket, badge: coupons.length },
    { id: 'reviews',    label: 'Avis à modérer',  icon: Star,   badge: reviews.length },
  ];

  /* ── render tree ── */
  const renderCatTree = (cats: Category[], depth = 0) =>
    cats.map(cat => (
      <div key={cat.id}>
        <div className={`flex items-center justify-between py-2.5 px-4 hover:bg-gray-50 rounded-lg group ${depth > 0 ? 'ml-6 border-l-2 border-gray-100 pl-4' : ''}`}>
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-gray-400"/>
            <span className="text-sm text-gray-700 font-medium">{cat.nom}</span>
            {cat.description && <span className="text-xs text-gray-400">— {cat.description}</span>}
            {cat.sousCategories?.length ? (
              <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">
                {cat.sousCategories.length} sous-cat.
              </span>
            ) : null}
          </div>
          <button onClick={() => deleteCategory(cat.id)}
            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all p-1 rounded">
            <Trash2 className="w-4 h-4"/>
          </button>
        </div>
        {cat.sousCategories?.length ? renderCatTree(cat.sousCategories, depth + 1) : null}
      </div>
    ));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
          <Shield className="w-5 h-5 text-white"/>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Administration ShopFlow</h1>
          <p className="text-gray-500 text-sm">Gestion globale de la plateforme</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-8 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium whitespace-nowrap flex items-center justify-center gap-2 transition-all min-w-[110px] ${
              tab === t.id ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}>
            <t.icon className="w-4 h-4"/>
            {t.label}
            {t.badge !== undefined && t.badge > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                tab === t.id ? 'bg-purple-100 text-purple-700' : 'bg-gray-200 text-gray-600'
              }`}>{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── STATS ── */}
      {tab === 'stats' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Chiffre d\'affaires', value: `${stats.chiffreAffairesGlobal?.toFixed(0) ?? 0} DT`, icon: TrendingUp, color: 'text-green-600 bg-green-50 border-green-100' },
              { label: 'Total commandes',     value: stats.totalCommandes,       icon: ShoppingBag, color: 'text-blue-600 bg-blue-50 border-blue-100' },
              { label: 'Commandes en attente',value: stats.commandesEnAttente,   icon: Clock,       color: 'text-yellow-600 bg-yellow-50 border-yellow-100' },
              { label: 'Utilisateurs',        value: stats.totalUtilisateurs,    icon: Users,       color: 'text-purple-600 bg-purple-50 border-purple-100' },
            ].map((s, i) => (
              <div key={i} className={`rounded-xl border p-5 ${s.color.split(' ').slice(1).join(' ')}`}>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 bg-white ${s.color.split(' ')[0]}`}>
                  <s.icon className="w-5 h-5"/>
                </div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {stats.topProduits?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-500"/> Top produits
              </h2>
              <div className="space-y-3">
                {stats.topProduits.slice(0, 5).map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className="w-7 h-7 bg-purple-100 text-purple-700 text-xs font-bold rounded-full flex items-center justify-center">{i + 1}</span>
                    <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={p.images?.[0] || 'https://via.placeholder.com/40'} alt={p.nom} className="w-full h-full object-cover"/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{p.nom}</p>
                      <p className="text-xs text-gray-400">{p.nombreAvis} avis</p>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{(p.prixPromo ?? p.prix).toFixed(3)} DT</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stats.commandesRecentes?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-purple-500"/> Commandes récentes
              </h2>
              <div className="space-y-2">
                {stats.commandesRecentes.slice(0, 5).map(o => (
                  <div key={o.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <span className="font-mono text-xs text-purple-700 font-semibold">{o.numeroCommande}</span>
                      <span className="text-xs text-gray-400 ml-2">· {o.customerNom}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{o.totalTTC.toFixed(3)} DT</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── USERS ── */}
      {tab === 'users' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">{users.length} utilisateurs</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {users.map(u => (
              <div key={u.userId}>
                <div
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setExpandedUser(expandedUser === u.userId ? null : u.userId)}
                >
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600 text-sm flex-shrink-0">
                    {u.prenom?.[0]}{u.nom?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{u.prenom} {u.nom}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[u.role]}`}>{u.role}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.actif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {u.actif ? 'Actif' : 'Inactif'}
                  </span>
                  {expandedUser === u.userId ? <ChevronUp className="w-4 h-4 text-gray-400"/> : <ChevronDown className="w-4 h-4 text-gray-400"/>}
                </div>
                {expandedUser === u.userId && (
                  <div className="px-6 pb-4 bg-gray-50 border-t border-gray-100">
                    <div className="flex items-center gap-3 pt-3">
                      <p className="text-xs text-gray-500">
                        Inscrit le {new Date(u.dateCreation).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                      <button
                        onClick={() => toggleUser(u)}
                        disabled={userLoading}
                        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                          u.actif
                            ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                            : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                        } disabled:opacity-50`}
                      >
                        {u.actif ? <><UserX className="w-3.5 h-3.5"/> Désactiver</> : <><UserCheck className="w-3.5 h-3.5"/> Activer</>}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CATEGORIES ── */}
      {tab === 'categories' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowCatForm(!showCatForm)}
              className="btn-primary flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4"/> Ajouter une catégorie
            </button>
          </div>

          {showCatForm && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Nouvelle catégorie</h3>
              <form onSubmit={addCategory} className="space-y-3">
                {catError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">{catError}</div>}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom <span className="text-red-500">*</span></label>
                    <input className="input" placeholder="Ex: Électronique" required
                      value={catForm.nom} onChange={e => setCatForm(p => ({ ...p, nom: e.target.value }))}/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input className="input" placeholder="Optionnel"
                      value={catForm.description} onChange={e => setCatForm(p => ({ ...p, description: e.target.value }))}/>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie parente</label>
                  <select className="input" value={catForm.parentId} onChange={e => setCatForm(p => ({ ...p, parentId: e.target.value }))}>
                    <option value="">Aucune (catégorie racine)</option>
                    {catFlat.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                  </select>
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setShowCatForm(false)}
                    className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-xl font-medium hover:bg-gray-50 text-sm">Annuler</button>
                  <button type="submit" disabled={catLoading}
                    className="flex-1 bg-primary text-white py-2 rounded-xl font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                    {catLoading ? 'Création...' : <><Check className="w-4 h-4"/> Créer</>}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            {categories.length === 0
              ? <p className="text-center text-gray-400 py-8">Aucune catégorie</p>
              : renderCatTree(categories)
            }
          </div>
        </div>
      )}

      {/* ── COUPONS ── */}
      {tab === 'coupons' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowCouponForm(!showCouponForm)}
              className="btn-primary flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4"/> Créer un coupon
            </button>
          </div>

          {showCouponForm && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Nouveau coupon</h3>
              <form onSubmit={addCoupon} className="space-y-3">
                {couponError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">{couponError}</div>}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Code <span className="text-red-500">*</span></label>
                    <input className="input uppercase" placeholder="PROMO20" required
                      value={couponForm.code} onChange={e => setCouponForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select className="input" value={couponForm.type} onChange={e => setCouponForm(p => ({ ...p, type: e.target.value }))}>
                      <option value="PERCENT">Pourcentage (%)</option>
                      <option value="FIXED">Montant fixe (DT)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valeur <span className="text-red-500">*</span></label>
                    <input className="input" type="number" step="0.01" min="0" placeholder="20" required
                      value={couponForm.valeur} onChange={e => setCouponForm(p => ({ ...p, valeur: e.target.value }))}/>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date d'expiration</label>
                    <input className="input" type="date"
                      value={couponForm.dateExpiration} onChange={e => setCouponForm(p => ({ ...p, dateExpiration: e.target.value }))}/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Usages max</label>
                    <input className="input" type="number" min="1" placeholder="100"
                      value={couponForm.usagesMax} onChange={e => setCouponForm(p => ({ ...p, usagesMax: e.target.value }))}/>
                  </div>
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setShowCouponForm(false)}
                    className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-xl font-medium hover:bg-gray-50 text-sm">Annuler</button>
                  <button type="submit" disabled={couponLoading}
                    className="flex-1 bg-primary text-white py-2 rounded-xl font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                    {couponLoading ? 'Création...' : <><Check className="w-4 h-4"/> Créer</>}
                  </button>
                </div>
              </form>
            </div>
          )}

          {coupons.length === 0
            ? <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">Aucun coupon</div>
            : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['Code', 'Type', 'Valeur', 'Usages', 'Expiration', 'Statut', ''].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {coupons.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono font-bold text-primary">{c.code}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.type === 'PERCENT' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                            {c.type === 'PERCENT' ? 'Pourcentage' : 'Fixe'}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold">{c.valeur}{c.type === 'PERCENT' ? '%' : ' DT'}</td>
                        <td className="px-4 py-3 text-gray-500">{c.usagesActuels}{c.usagesMax ? `/${c.usagesMax}` : ''}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {c.dateExpiration ? new Date(c.dateExpiration).toLocaleDateString('fr-FR') : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.actif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                            {c.actif ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => deleteCoupon(c.id)} className="text-red-400 hover:text-red-600 p-1 rounded">
                            <Trash2 className="w-4 h-4"/>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        </div>
      )}

      {/* ── REVIEWS ── */}
      {tab === 'reviews' && (
        <div className="space-y-3">
          {reviews.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-500"/>
              </div>
              <p className="text-gray-500 text-lg font-medium">Aucun avis à modérer</p>
              <p className="text-gray-400 text-sm mt-1">Tous les avis ont été traités</p>
            </div>
          ) : reviews.map(r => (
            <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start gap-4 flex-wrap">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500 flex-shrink-0">
                  {r.customerNom?.[0] ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-gray-900 text-sm">{r.customerNom}</span>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs text-gray-400">
                      {new Date(r.dateCreation).toLocaleDateString('fr-FR')}
                    </span>
                    <div className="flex">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`w-3.5 h-3.5 ${s <= r.note ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}/>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{r.commentaire || <span className="italic text-gray-400">Aucun commentaire</span>}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => approveReview(r.id)} disabled={reviewLoading === r.id}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-green-50 text-green-600 border border-green-200 rounded-lg hover:bg-green-100 disabled:opacity-50">
                    <Check className="w-3.5 h-3.5"/> Approuver
                  </button>
                  <button onClick={() => deleteReview(r.id)} disabled={reviewLoading === r.id}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50">
                    <X className="w-3.5 h-3.5"/> Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
