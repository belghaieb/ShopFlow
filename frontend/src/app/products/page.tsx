'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { productApi, categoryApi } from '@/lib/api';
import { Product, Category, PageResponse } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import Spinner from '@/components/Spinner';
import EmptyState from '@/components/EmptyState';
import { SlidersHorizontal, X } from 'lucide-react';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    categorie: searchParams.get('categorie') || '',
    prixMin: searchParams.get('prixMin') || '',
    prixMax: searchParams.get('prixMax') || '',
    promo: searchParams.get('promo') === 'true',
    q: searchParams.get('q') || '',
    sort: 'dateCreation,desc',
  });

  const loadProducts = useCallback(async (currentPage = 0) => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {
        page: currentPage,
        size: 12,
        sort: filters.sort,
      };
      if (filters.categorie) params.categorie = filters.categorie;
      if (filters.prixMin) params.prixMin = filters.prixMin;
      if (filters.prixMax) params.prixMax = filters.prixMax;
      if (filters.promo) params.promo = true;

      let res;
      if (filters.q) {
        res = await productApi.search(filters.q, params);
      } else {
        res = await productApi.getAll(params);
      }
      const data: PageResponse<Product> = res.data;
      setProducts(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
      setPage(currentPage);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    categoryApi.getAll().then(r => setCategories(r.data));
  }, []);

  useEffect(() => { loadProducts(0); }, [filters]);

  const clearFilters = () => setFilters({ categorie: '', prixMin: '', prixMax: '', promo: false, q: '', sort: 'dateCreation,desc' });

  const hasFilters = filters.categorie || filters.prixMin || filters.prixMax || filters.promo || filters.q;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {filters.q ? `Résultats pour "${filters.q}"` : 'Catalogue produits'}
          </h1>
          {!loading && <p className="text-sm text-gray-500 mt-1">{totalElements} produit{totalElements > 1 ? 's' : ''} trouvé{totalElements > 1 ? 's' : ''}</p>}
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 md:hidden">
          <SlidersHorizontal className="w-4 h-4" /> Filtres
        </button>
      </div>

      <div className="flex gap-8">
        {/* Filters sidebar */}
        <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-64 flex-shrink-0`}>
          <div className="bg-white rounded-xl border border-gray-100 p-5 sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Filtres</h2>
              {hasFilters && (
                <button onClick={clearFilters} className="text-xs text-accent hover:underline flex items-center gap-1">
                  <X className="w-3 h-3" /> Effacer
                </button>
              )}
            </div>

            {/* Search */}
            <div className="mb-5">
              <label className="text-sm font-medium text-gray-700 block mb-2">Recherche</label>
              <input className="input text-sm" placeholder="Nom, description..."
                value={filters.q}
                onChange={e => setFilters(p => ({ ...p, q: e.target.value }))} />
            </div>

            {/* Category */}
            <div className="mb-5">
              <label className="text-sm font-medium text-gray-700 block mb-2">Catégorie</label>
              <select className="input text-sm" value={filters.categorie}
                onChange={e => setFilters(p => ({ ...p, categorie: e.target.value }))}>
                <option value="">Toutes</option>
                {categories.map(c => (
                  <option key={c.id} value={c.nom}>{c.nom}</option>
                ))}
              </select>
            </div>

            {/* Price range */}
            <div className="mb-5">
              <label className="text-sm font-medium text-gray-700 block mb-2">Prix (DT)</label>
              <div className="flex gap-2">
                <input className="input text-sm" type="number" placeholder="Min"
                  value={filters.prixMin}
                  onChange={e => setFilters(p => ({ ...p, prixMin: e.target.value }))} />
                <input className="input text-sm" type="number" placeholder="Max"
                  value={filters.prixMax}
                  onChange={e => setFilters(p => ({ ...p, prixMax: e.target.value }))} />
              </div>
            </div>

            {/* Promo */}
            <label className="flex items-center gap-2 cursor-pointer mb-5">
              <input type="checkbox" checked={filters.promo}
                onChange={e => setFilters(p => ({ ...p, promo: e.target.checked }))}
                className="w-4 h-4 text-primary rounded" />
              <span className="text-sm text-gray-700">Promotions uniquement</span>
            </label>

            {/* Sort */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Trier par</label>
              <select className="input text-sm" value={filters.sort}
                onChange={e => setFilters(p => ({ ...p, sort: e.target.value }))}>
                <option value="dateCreation,desc">Nouveautés</option>
                <option value="prix,asc">Prix croissant</option>
                <option value="prix,desc">Prix décroissant</option>
                <option value="nom,asc">Nom A-Z</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          {loading ? <Spinner /> : products.length === 0 ? (
            <EmptyState message="Aucun produit trouvé" action={
              <button onClick={clearFilters} className="btn-primary text-sm">Réinitialiser les filtres</button>
            } />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button key={i} onClick={() => loadProducts(i)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                        page === i ? 'bg-primary text-white' : 'bg-white border border-gray-200 hover:bg-gray-50'
                      }`}>
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
