package com.shopflow.service;

import com.shopflow.dto.response.DashboardAdminResponse;
import com.shopflow.dto.response.DashboardCustomerResponse;
import com.shopflow.dto.response.DashboardSellerResponse;
import com.shopflow.dto.response.OrderResponse;
import com.shopflow.dto.response.ProductResponse;
import com.shopflow.dto.response.ReviewResponse;
import com.shopflow.repository.OrderRepository;
import com.shopflow.repository.ProductRepository;
import com.shopflow.repository.ReviewRepository;
import com.shopflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final OrderService orderService;
    private final ProductService productService;
    private final ReviewService reviewService;

    @Transactional(readOnly = true)
    public DashboardAdminResponse getAdminDashboard() {
        List<ProductResponse> topProduits = productRepository
                .findTopSelling(PageRequest.of(0, 5))
                .stream().map(productService::toResponse).collect(Collectors.toList());

        List<OrderResponse> recent = orderRepository
                .findAll(PageRequest.of(0, 10)).stream()
                .map(orderService::toResponse).collect(Collectors.toList());

        return DashboardAdminResponse.builder()
                .chiffreAffairesGlobal(orderRepository.totalRevenue())
                .totalCommandes(orderRepository.count())
                .commandesEnAttente(orderRepository.countPendingOrders())
                .totalUtilisateurs(userRepository.count())
                .topProduits(topProduits)
                .commandesRecentes(recent)
                .build();
    }

    @Transactional(readOnly = true)
    public DashboardSellerResponse getSellerDashboard(Long sellerId) {
        List<ProductResponse> alertes = productRepository.findLowStock(sellerId, 5)
                .stream().map(productService::toResponse).collect(Collectors.toList());

        List<OrderResponse> recent = orderRepository
                .findOrdersBySeller(sellerId, PageRequest.of(0, 5))
                .stream().map(orderService::toResponse).collect(Collectors.toList());

        return DashboardSellerResponse.builder()
                .revenus(orderRepository.sumRevenuesBySeller(sellerId))
                .commandesEnAttente(orderRepository.countPendingOrdersBySeller(sellerId))
                .totalProduits(productRepository.countBySellerIdAndActifTrue(sellerId))
                .alertesStockFaible(alertes)
                .commandesRecentes(recent)
                .build();
    }

    @Transactional(readOnly = true)
    public DashboardCustomerResponse getCustomerDashboard(Long customerId) {
        List<OrderResponse> commandesRecentes = orderRepository
                .findByCustomerIdOrderByDateCommandeDesc(customerId, PageRequest.of(0, 5))
                .stream().map(orderService::toResponse).collect(Collectors.toList());

        long enCours = orderRepository.countActiveOrdersByCustomer(customerId);

        List<ReviewResponse> avis = reviewRepository
                .findByCustomerIdOrderByDateCreationDesc(customerId, PageRequest.of(0, 5))
                .stream().map(reviewService::toResponsePublic).collect(Collectors.toList());

        long total = orderRepository.countByCustomerId(customerId);

        return DashboardCustomerResponse.builder()
                .totalCommandes(total)
                .commandesEnCours(enCours)
                .commandesRecentes(commandesRecentes)
                .derniersAvis(avis)
                .build();
    }
}
