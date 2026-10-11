package com.shopflow.service;

import com.shopflow.dto.request.ReviewRequest;
import com.shopflow.dto.response.ReviewResponse;
import com.shopflow.entity.Product;
import com.shopflow.entity.Review;
import com.shopflow.entity.User;
import com.shopflow.enums.Role;
import com.shopflow.exception.BusinessException;
import com.shopflow.exception.ResourceNotFoundException;
import com.shopflow.repository.OrderRepository;
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

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock ReviewRepository reviewRepository;
    @Mock ProductRepository productRepository;
    @Mock UserRepository userRepository;
    @Mock OrderRepository orderRepository;

    @InjectMocks ReviewService reviewService;

    private User customer;
    private Product product;

    @BeforeEach
    void setUp() {
        customer = User.builder()
                .id(1L).email("client@test.com")
                .prenom("Jean").nom("Dupont")
                .role(Role.CUSTOMER).actif(true).build();

        product = Product.builder()
                .id(100L).nom("Produit Test")
                .images(new ArrayList<>()).variantes(new ArrayList<>())
                .avis(new ArrayList<>()).actif(true).build();
    }

    @Test
    void create_withPurchase_success() {
        ReviewRequest request = new ReviewRequest();
        request.setProductId(100L);
        request.setNote(5);
        request.setCommentaire("Excellent !");

        when(orderRepository.existsByCustomerIdAndLignesProductId(1L, 100L)).thenReturn(true);
        when(reviewRepository.existsByCustomerIdAndProductId(1L, 100L)).thenReturn(false);
        when(userRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(productRepository.findById(100L)).thenReturn(Optional.of(product));
        when(reviewRepository.save(any())).thenAnswer(inv -> {
            Review r = inv.getArgument(0);
            return Review.builder().id(1L)
                    .customer(r.getCustomer()).product(r.getProduct())
                    .note(r.getNote()).commentaire(r.getCommentaire())
                    .approuve(false).build();
        });

        ReviewResponse response = reviewService.create(1L, request);

        assertThat(response.getNote()).isEqualTo(5);
        assertThat(response.getCommentaire()).isEqualTo("Excellent !");
        assertThat(response.isApprouve()).isFalse();
    }

    @Test
    void create_noPurchase_throwsBusinessException() {
        ReviewRequest request = new ReviewRequest();
        request.setProductId(100L);
        request.setNote(4);

        when(orderRepository.existsByCustomerIdAndLignesProductId(1L, 100L)).thenReturn(false);

        assertThatThrownBy(() -> reviewService.create(1L, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("acheté");
    }

    @Test
    void create_alreadyReviewed_throwsBusinessException() {
        ReviewRequest request = new ReviewRequest();
        request.setProductId(100L);
        request.setNote(3);

        when(orderRepository.existsByCustomerIdAndLignesProductId(1L, 100L)).thenReturn(true);
        when(reviewRepository.existsByCustomerIdAndProductId(1L, 100L)).thenReturn(true);

        assertThatThrownBy(() -> reviewService.create(1L, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("déjà");
    }

    @Test
    void approve_success() {
        Review review = Review.builder()
                .id(1L).customer(customer).product(product)
                .note(4).commentaire("Bien").approuve(false).build();

        when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));
        when(reviewRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ReviewResponse response = reviewService.approve(1L);

        assertThat(response.isApprouve()).isTrue();
    }

    @Test
    void approve_notFound_throwsException() {
        when(reviewRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> reviewService.approve(999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void getByProduct_returnsApprovedOnly() {
        Review review = Review.builder()
                .id(1L).customer(customer).product(product)
                .note(5).commentaire("Top").approuve(true).build();
        Page<Review> page = new PageImpl<>(List.of(review));

        when(reviewRepository.findByProductIdAndApprouveTrue(eq(100L), any())).thenReturn(page);

        Page<ReviewResponse> result = reviewService.getByProduct(100L, PageRequest.of(0, 10));

        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).isApprouve()).isTrue();
    }
}
