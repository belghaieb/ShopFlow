package com.shopflow.service;

import com.shopflow.dto.request.ProductRequest;
import com.shopflow.dto.response.ProductResponse;
import com.shopflow.entity.Product;
import com.shopflow.entity.User;
import com.shopflow.enums.Role;
import com.shopflow.exception.ResourceNotFoundException;
import com.shopflow.repository.CategoryRepository;
import com.shopflow.repository.ProductRepository;
import com.shopflow.repository.ReviewRepository;
import com.shopflow.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock ProductRepository productRepository;
    @Mock UserRepository userRepository;
    @Mock CategoryRepository categoryRepository;
    @Mock ReviewRepository reviewRepository;

    @InjectMocks ProductService productService;

    private User seller;
    private Product product;

    @BeforeEach
    void setUp() {
        seller = User.builder()
                .id(1L).email("seller@test.com")
                .prenom("Alice").nom("Martin")
                .role(Role.SELLER).actif(true).build();

        product = Product.builder()
                .id(100L).seller(seller).nom("Produit Test")
                .description("Description").prix(new BigDecimal("25.00"))
                .stock(50).actif(true)
                .categories(new HashSet<>()).images(new ArrayList<>())
                .variantes(new ArrayList<>()).avis(new ArrayList<>()).build();
    }

    @Test
    void getById_exists_returnsResponse() {
        when(productRepository.findById(100L)).thenReturn(Optional.of(product));
        when(reviewRepository.averageNoteByProductId(100L)).thenReturn(4.5);

        ProductResponse response = productService.getById(100L);

        assertThat(response.getId()).isEqualTo(100L);
        assertThat(response.getNom()).isEqualTo("Produit Test");
        assertThat(response.getNoteMoyenne()).isEqualTo(4.5);
    }

    @Test
    void getById_notFound_throwsException() {
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.getById(999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void create_success_returnsResponse() {
        ProductRequest request = new ProductRequest();
        request.setNom("Nouveau Produit");
        request.setDescription("Desc");
        request.setPrix(new BigDecimal("30.00"));
        request.setStock(10);
        request.setCategorieIds(new java.util.HashSet<>());
        request.setImages(List.of("http://img.com/1.jpg"));

        when(userRepository.findById(1L)).thenReturn(Optional.of(seller));
        when(categoryRepository.findAllById(any())).thenReturn(List.of());
        when(productRepository.save(any())).thenAnswer(inv -> {
            Product p = inv.getArgument(0);
            p = Product.builder().id(200L).seller(seller)
                    .nom(p.getNom()).description(p.getDescription())
                    .prix(p.getPrix()).stock(p.getStock()).actif(true)
                    .categories(new HashSet<>()).images(new ArrayList<>())
                    .variantes(new ArrayList<>()).avis(new ArrayList<>()).build();
            return p;
        });
        when(reviewRepository.averageNoteByProductId(any())).thenReturn(null);

        ProductResponse response = productService.create(request, 1L);

        assertThat(response.getNom()).isEqualTo("Nouveau Produit");
        assertThat(response.getId()).isEqualTo(200L);
    }

    @Test
    void create_sellerNotFound_throwsException() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.create(new ProductRequest(), 99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void update_ownProduct_succeeds() {
        ProductRequest request = new ProductRequest();
        request.setNom("Modifié");
        request.setDescription("Desc");
        request.setPrix(new BigDecimal("35.00"));
        request.setStock(20);

        when(productRepository.findById(100L)).thenReturn(Optional.of(product));
        when(productRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(reviewRepository.averageNoteByProductId(any())).thenReturn(null);

        ProductResponse response = productService.update(100L, request, 1L, "ROLE_SELLER");

        assertThat(response.getNom()).isEqualTo("Modifié");
        assertThat(response.getPrix()).isEqualByComparingTo("35.00");
    }

    @Test
    void update_otherSellerProduct_throwsAccessDenied() {
        ProductRequest request = new ProductRequest();
        request.setNom("Hack");
        request.setPrix(new BigDecimal("1.00"));

        when(productRepository.findById(100L)).thenReturn(Optional.of(product));

        assertThatThrownBy(() -> productService.update(100L, request, 99L, "ROLE_SELLER"))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void softDelete_ownProduct_setsInactive() {
        when(productRepository.findById(100L)).thenReturn(Optional.of(product));
        when(productRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        productService.softDelete(100L, 1L, "ROLE_SELLER");

        assertThat(product.isActif()).isFalse();
    }

    @Test
    void softDelete_adminOnAnyProduct_succeeds() {
        when(productRepository.findById(100L)).thenReturn(Optional.of(product));
        when(productRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        productService.softDelete(100L, 999L, "ROLE_ADMIN");

        assertThat(product.isActif()).isFalse();
    }

    @Test
    void getProducts_withFilters_returnsPage() {
        Page<Product> page = new PageImpl<>(List.of(product));
        when(productRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);
        when(reviewRepository.averageNoteByProductId(any())).thenReturn(null);

        Page<ProductResponse> result = productService.getProducts(
                null, null, null, null, null, PageRequest.of(0, 12));

        assertThat(result.getTotalElements()).isEqualTo(1);
    }

    @Test
    void search_returnsMatchingProducts() {
        Page<Product> page = new PageImpl<>(List.of(product));
        when(productRepository.searchFullText(eq("test"), any())).thenReturn(page);
        when(reviewRepository.averageNoteByProductId(any())).thenReturn(null);

        Page<ProductResponse> result = productService.search("test", PageRequest.of(0, 12));

        assertThat(result.getContent()).hasSize(1);
    }
}
