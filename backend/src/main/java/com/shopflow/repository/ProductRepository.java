package com.shopflow.repository;

import com.shopflow.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long>,
        JpaSpecificationExecutor<Product> {

    Page<Product> findBySellerIdAndActifTrue(Long sellerId, Pageable pageable);

    Long countBySellerIdAndActifTrue(Long sellerId);

    @Query("SELECT p FROM Product p WHERE p.actif = true AND " +
           "(LOWER(p.nom) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<Product> searchFullText(@Param("q") String q, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.actif = true ORDER BY p.dateCreation DESC")
    List<Product> findTopSelling(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.seller.id = :sellerId AND p.stock <= :threshold AND p.actif = true")
    List<Product> findLowStock(@Param("sellerId") Long sellerId, @Param("threshold") int threshold);
}
