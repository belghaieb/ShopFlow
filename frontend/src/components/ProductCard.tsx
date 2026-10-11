import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/types';
import RatingStars from './RatingStars';
import { ShoppingCart } from 'lucide-react';

interface Props {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: Props) {
  const image = product.images?.[0] || 'https://via.placeholder.com/400x300?text=ShopFlow';
  const prix = product.prixPromo || product.prix;
  const haPromo = !!product.prixPromo;
  const remise = haPromo ? Math.round(((product.prix - product.prixPromo!) / product.prix) * 100) : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
      <Link href={`/products/${product.id}`}>
        <div className="relative h-52 bg-gray-100 overflow-hidden">
          <img
            src={image}
            alt={product.nom}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {haPromo && (
            <span className="absolute top-2 left-2 bg-accent text-white text-xs font-bold px-2 py-1 rounded-full">
              -{remise}%
            </span>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">Rupture de stock</span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        {product.nomBoutique && (
          <p className="text-xs text-blue-600 font-medium mb-1">{product.nomBoutique}</p>
        )}
        <Link href={`/products/${product.id}`}>
          <h3 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2 hover:text-primary transition-colors">
            {product.nom}
          </h3>
        </Link>

        <div className="flex items-center gap-1 mb-3">
          <RatingStars note={product.noteMoyenne || 0} small />
          <span className="text-xs text-gray-500">({product.nombreAvis})</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="font-bold text-gray-900 text-lg">{prix.toFixed(3)} DT</span>
            {haPromo && (
              <span className="text-xs text-gray-400 line-through ml-2">{product.prix.toFixed(3)} DT</span>
            )}
          </div>
          {onAddToCart && product.stock > 0 && (
            <button
              onClick={() => onAddToCart(product)}
              className="bg-primary text-white p-2 rounded-lg hover:bg-primary-dark transition-colors"
              title="Ajouter au panier"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
