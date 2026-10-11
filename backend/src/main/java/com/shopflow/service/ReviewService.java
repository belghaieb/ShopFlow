package com.shopflow.service;

import com.shopflow.dto.request.ReviewRequest;
import com.shopflow.dto.response.ReviewResponse;
import com.shopflow.mapper.ReviewMapper;
import com.shopflow.entity.Product;
import com.shopflow.entity.Review;
import com.shopflow.entity.User;
import com.shopflow.exception.BusinessException;
import com.shopflow.exception.ResourceNotFoundException;
import com.shopflow.repository.OrderRepository;
import com.shopflow.repository.ProductRepository;
import com.shopflow.repository.ReviewRepository;
import com.shopflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final ReviewMapper reviewMapper;

    @Transactional
    public ReviewResponse create(Long customerId, ReviewRequest request) {
        if (!orderRepository.existsByCustomerIdAndLignesProductId(customerId, request.getProductId())) {
            throw new BusinessException("Vous devez avoir acheté ce produit pour laisser un avis", HttpStatus.FORBIDDEN);
        }
        if (reviewRepository.existsByCustomerIdAndProductId(customerId, request.getProductId())) {
            throw new BusinessException("Vous avez déjà laissé un avis pour ce produit", HttpStatus.CONFLICT);
        }
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Client", customerId));
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Produit", request.getProductId()));

        Review review = Review.builder()
                .customer(customer).product(product)
                .note(request.getNote()).commentaire(request.getCommentaire()).build();
        return toResponse(reviewRepository.save(review));
    }

    @Transactional(readOnly = true)
    public Page<ReviewResponse> getByProduct(Long productId, Pageable pageable) {
        return reviewRepository.findByProductIdAndApprouveTrue(productId, pageable).map(this::toResponse);
    }

    @Transactional
    public ReviewResponse approve(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Avis", id));
        review.setApprouve(true);
        return toResponse(reviewRepository.save(review));
    }

    @Transactional(readOnly = true)
    public Page<ReviewResponse> getPending(Pageable pageable) {
        return reviewRepository.findByApprouveIsFalseOrderByDateCreationDesc(pageable).map(this::toResponse);
    }

    @Transactional
    public void delete(Long id) {
        reviewRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Avis", id));
        reviewRepository.deleteById(id);
    }

    public ReviewResponse toResponsePublic(Review r) {
        return reviewMapper.toResponse(r);
    }

    ReviewResponse toResponse(Review r) {
        return reviewMapper.toResponse(r);
    }
}
