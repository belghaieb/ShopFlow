package com.shopflow.service;

import com.shopflow.dto.request.ProductRequest;
import com.shopflow.dto.response.ProductResponse;
import com.shopflow.entity.Category;
import com.shopflow.entity.Product;
import com.shopflow.entity.User;
import com.shopflow.exception.BusinessException;
import com.shopflow.exception.ResourceNotFoundException;
import com.shopflow.mapper.ProductMapper;
import com.shopflow.repository.CategoryRepository;
import com.shopflow.repository.ProductRepository;
import com.shopflow.repository.ProductSpecification;
import com.shopflow.repository.ReviewRepository;
import com.shopflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ReviewRepository reviewRepository;
    private final ProductMapper productMapper;

    @Transactional(readOnly = true)
    public Page<ProductResponse> getProducts(String categorie, BigDecimal prixMin,
                                              BigDecimal prixMax, Boolean promo,
                                              Long sellerId, Pageable pageable) {
        Specification<Product> spec = ProductSpecification.withFilters(
                categorie, prixMin, prixMax, promo, sellerId);
        return productRepository.findAll(spec, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public ProductResponse getById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produit", id));
        return toResponse(product);
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> search(String q, Pageable pageable) {
        return productRepository.searchFullText(q, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getTopSelling() {
        return productRepository.findTopSelling(PageRequest.of(0, 10))
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public ProductResponse create(ProductRequest request, Long sellerId) {
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendeur", sellerId));

        Set<Category> categories = new HashSet<>();
        if (request.getCategorieIds() != null) {
            categories = new HashSet<>(categoryRepository.findAllById(request.getCategorieIds()));
        }

        Product product = Product.builder()
                .seller(seller)
                .nom(request.getNom())
                .description(request.getDescription())
                .prix(request.getPrix())
                .prixPromo(request.getPrixPromo())
                .stock(request.getStock() != null ? request.getStock() : 0)
                .categories(categories)
                .images(request.getImages() != null ? request.getImages() : List.of())
                .build();

        return toResponse(productRepository.save(product));
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest request, Long userId, String role) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produit", id));

        if (!role.equals("ROLE_ADMIN") && !product.getSeller().getId().equals(userId)) {
            throw new AccessDeniedException("Vous ne pouvez modifier que vos propres produits");
        }

        product.setNom(request.getNom());
        product.setDescription(request.getDescription());
        product.setPrix(request.getPrix());
        product.setPrixPromo(request.getPrixPromo());
        if (request.getStock() != null) product.setStock(request.getStock());
        if (request.getImages() != null) product.setImages(request.getImages());

        if (request.getCategorieIds() != null) {
            Set<Category> categories = new HashSet<>(categoryRepository.findAllById(request.getCategorieIds()));
            product.setCategories(categories);
        }

        return toResponse(productRepository.save(product));
    }

    @Transactional
    public void softDelete(Long id, Long userId, String role) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produit", id));
        if (!role.equals("ROLE_ADMIN") && !product.getSeller().getId().equals(userId)) {
            throw new AccessDeniedException("Vous ne pouvez supprimer que vos propres produits");
        }
        product.setActif(false);
        productRepository.save(product);
    }

    public ProductResponse toResponse(Product p) {
        return productMapper.toResponse(p);
    }

}
