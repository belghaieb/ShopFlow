import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ShopFlow — Marketplace B2C',
  description: 'Découvrez des milliers de produits de qualité',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen bg-gray-50">{children}</main>
          <footer className="bg-gray-900 text-white py-12 mt-16">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-bold text-blue-400 mb-3">ShopFlow</h3>
                <p className="text-gray-400 text-sm">La marketplace B2C de référence pour les achats en ligne.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Liens rapides</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><a href="/products" className="hover:text-white">Catalogue</a></li>
                  <li><a href="/auth/register" className="hover:text-white">Devenir vendeur</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Contact</h4>
                <p className="text-gray-400 text-sm">support@shopflow.com</p>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
