-- Données de démonstration ShopFlow (H2 compatible)
-- Passwords = BCrypt("password123")

INSERT INTO users (email, mot_de_passe, prenom, nom, role, actif, date_creation) VALUES
('admin@shopflow.com',  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin',  'ShopFlow', 'ADMIN',    TRUE, CURRENT_TIMESTAMP),
('seller@shopflow.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Marie',  'Dupont',   'SELLER',   TRUE, CURRENT_TIMESTAMP),
('seller2@shopflow.com','$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jean',   'Martin',   'SELLER',   TRUE, CURRENT_TIMESTAMP),
('client@shopflow.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Alice',  'Bernard',  'CUSTOMER', TRUE, CURRENT_TIMESTAMP),
('client2@shopflow.com','$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Bob',    'Petit',    'CUSTOMER', TRUE, CURRENT_TIMESTAMP);

INSERT INTO seller_profiles (user_id, nom_boutique, description, logo, note) VALUES
(2, 'La Boutique Mode',  'Vetements tendance pour toute la famille',          'https://via.placeholder.com/100', 4.5),
(3, 'Tech Express',      'Les meilleurs produits high-tech au meilleur prix', 'https://via.placeholder.com/100', 4.2);

INSERT INTO addresses (user_id, rue, ville, code_postal, pays, principal) VALUES
(4, '12 rue de la Paix',     'Paris',     '75001', 'France', TRUE),
(4, '5 avenue Victor Hugo',  'Lyon',      '69001', 'France', FALSE),
(5, '8 boulevard Haussmann', 'Marseille', '13001', 'France', TRUE);

INSERT INTO categories (nom, description, parent_id) VALUES
('Mode',         'Vetements et accessoires',   NULL),
('Electronique', 'High-tech et gadgets',       NULL),
('Maison',       'Decoration et mobilier',     NULL),
('Homme',        'Vetements pour homme',       1),
('Femme',        'Vetements pour femme',       1),
('Smartphones',  'Telephones et accessoires',  2),
('Ordinateurs',  'PC laptops et accessoires',  2);

INSERT INTO products (seller_id, nom, description, prix, prix_promo, stock, actif, date_creation) VALUES
(2, 'T-Shirt Classic',    'T-shirt coton bio coupe regular',              29.99, 19.99, 50, TRUE, CURRENT_TIMESTAMP),
(2, 'Jean Slim Fit',      'Jean stretch coupe slim grande resistance',    59.99, NULL,  30, TRUE, CURRENT_TIMESTAMP),
(2, 'Robe Fleurie Ete',   'Robe legere imprime floral ideale pour ete',  44.99, 34.99, 25, TRUE, CURRENT_TIMESTAMP),
(2, 'Veste en Cuir',      'Veste en cuir veritable style classique',    199.99, NULL,  10, TRUE, CURRENT_TIMESTAMP),
(3, 'Smartphone Pro 15',  'Ecran AMOLED 6.7p 256GB 5G',                899.99, 799.99,15, TRUE, CURRENT_TIMESTAMP),
(3, 'Laptop UltraSlim',   'Intel Core i7 16GB RAM 512GB SSD',         1299.99, NULL,   8, TRUE, CURRENT_TIMESTAMP),
(3, 'Ecouteurs Sans Fil', 'Reduction de bruit active autonomie 30h',   149.99, 99.99, 40, TRUE, CURRENT_TIMESTAMP),
(3, 'Tablette HD 10',     'Ecran Full HD 128GB Wi-Fi 4G',              349.99, NULL,  20, TRUE, CURRENT_TIMESTAMP);

INSERT INTO product_images (product_id, image_url) VALUES
(1,'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'),
(2,'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400'),
(3,'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400'),
(4,'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400'),
(5,'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400'),
(6,'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400'),
(7,'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'),
(8,'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400');

INSERT INTO product_categories (product_id, category_id) VALUES
(1,1),(1,4),(1,5),(2,1),(2,4),(3,1),(3,5),(4,1),(4,4),(4,5),
(5,2),(5,6),(6,2),(6,7),(7,2),(7,6),(8,2);

INSERT INTO product_variants (product_id, attribut, valeur, stock_supplementaire, prix_delta) VALUES
(1,'Taille','S',10,0.00),(1,'Taille','M',15,0.00),(1,'Taille','L',15,0.00),(1,'Taille','XL',10,2.00),
(2,'Taille','38',8,0.00),(2,'Taille','40',10,0.00),(2,'Taille','42',8,0.00),
(2,'Couleur','Bleu',15,0.00),(2,'Couleur','Noir',15,0.00);

INSERT INTO coupons (code, type, valeur, date_expiration, usages_max, usages_actuels, actif) VALUES
('BIENVENUE10','PERCENT',10.00,'2026-12-31 23:59:59',1000,0,TRUE),
('REMISE5',    'FIXED',   5.00,'2026-06-30 23:59:59', 500,0,TRUE),
('SUMMER20',   'PERCENT',20.00,'2026-08-31 23:59:59', 200,0,TRUE);
