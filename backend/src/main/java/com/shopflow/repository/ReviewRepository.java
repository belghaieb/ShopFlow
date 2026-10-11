package com.shopflow.repository;

import com.shopflow.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    Page<Review> findByProductIdAndApprouveTrue(Long productId, Pageable pageable);
    boolean existsByCustomerIdAndProductId(Long customerId, Long productId);

    @Query("SELECT AVG(r.note) FROM Review r WHERE r.product.id = :productId AND r.approuve = true")
    Double averageNoteByProductId(@Param("productId") Long productId);

    java.util.List<Review> findByCustomerIdOrderByDateCreationDesc(Long customerId, Pageable pageable);
    Page<Review> findByApprouveIsFalseOrderByDateCreationDesc(Pageable pageable);
}
