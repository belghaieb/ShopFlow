package com.shopflow.repository;

import com.shopflow.entity.Order;
import com.shopflow.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    Page<Order> findByCustomerIdOrderByDateCommandeDesc(Long customerId, Pageable pageable);

    @Query("SELECT COALESCE(SUM(o.totalTTC), 0) FROM Order o WHERE o.statut <> 'CANCELLED'")
    BigDecimal totalRevenue();

    @Query("SELECT COUNT(o) FROM Order o WHERE o.statut = 'PENDING'")
    Long countPendingOrders();

    @Query("SELECT COALESCE(SUM(oi.prixUnitaire * oi.quantite), 0) FROM OrderItem oi " +
           "WHERE oi.product.seller.id = :sellerId AND oi.order.statut <> 'CANCELLED'")
    BigDecimal sumRevenuesBySeller(@Param("sellerId") Long sellerId);

    @Query("SELECT o FROM Order o JOIN o.lignes oi WHERE oi.product.seller.id = :sellerId " +
           "GROUP BY o ORDER BY o.dateCommande DESC")
    Page<Order> findOrdersBySeller(@Param("sellerId") Long sellerId, Pageable pageable);

    @Query("SELECT COUNT(DISTINCT o) FROM Order o JOIN o.lignes oi " +
           "WHERE oi.product.seller.id = :sellerId AND o.statut = 'PENDING'")
    Long countPendingOrdersBySeller(@Param("sellerId") Long sellerId);

    @Query("SELECT COUNT(o) > 0 FROM Order o JOIN o.lignes oi " +
           "WHERE o.customer.id = :customerId AND oi.product.id = :productId")
    boolean existsByCustomerIdAndLignesProductId(@Param("customerId") Long customerId,
                                                  @Param("productId") Long productId);

    long countByCustomerId(Long customerId);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.customer.id = :customerId " +
           "AND o.statut NOT IN ('DELIVERED', 'CANCELLED')")
    long countActiveOrdersByCustomer(@Param("customerId") Long customerId);
}
