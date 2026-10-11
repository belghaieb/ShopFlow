package com.shopflow.service;

import com.shopflow.dto.request.PlaceOrderRequest;
import com.shopflow.dto.response.OrderResponse;
import com.shopflow.mapper.OrderMapper;
import com.shopflow.entity.*;
import com.shopflow.enums.CouponType;
import com.shopflow.enums.OrderStatus;
import com.shopflow.exception.BusinessException;
import com.shopflow.exception.InsufficientStockException;
import com.shopflow.exception.ResourceNotFoundException;
import com.shopflow.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Year;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartService cartService;
    private final UserRepository userRepository;
    private final CouponRepository couponRepository;
    private final ProductRepository productRepository;
    private final OrderMapper orderMapper;

    private static final BigDecimal FRAIS_LIVRAISON = new BigDecimal("5.00");

    @Transactional
    public OrderResponse placeOrder(Long customerId, PlaceOrderRequest request) {
        Cart cart = cartService.getOrCreateCart(customerId);

        if (cart.getLignes().isEmpty()) {
            throw new BusinessException("Le panier est vide", HttpStatus.BAD_REQUEST);
        }

        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Client", customerId));

        Address address = customer.getAdresses().stream()
                .filter(a -> a.getId().equals(request.getAddressId()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Adresse", request.getAddressId()));

        // Vérification finale du stock
        cart.getLignes().forEach(item -> {
            if (item.getProduct().getStock() < item.getQuantite()) {
                throw new InsufficientStockException(item.getProduct().getNom());
            }
        });

        // Calcul des totaux
        BigDecimal sousTotal = cart.getLignes().stream()
                .map(i -> {
                    BigDecimal pu = i.getProduct().getPrixPromo() != null
                            ? i.getProduct().getPrixPromo() : i.getProduct().getPrix();
                    return pu.multiply(BigDecimal.valueOf(i.getQuantite()));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal remise = BigDecimal.ZERO;
        if (cart.getCouponCode() != null) {
            Coupon coupon = couponRepository.findByCodeAndActifTrue(cart.getCouponCode()).orElse(null);
            if (coupon != null) {
                remise = coupon.getType() == CouponType.PERCENT
                        ? sousTotal.multiply(coupon.getValeur()).divide(BigDecimal.valueOf(100))
                        : coupon.getValeur();
                coupon.setUsagesActuels(coupon.getUsagesActuels() + 1);
                couponRepository.save(coupon);
            }
        }

        BigDecimal total = sousTotal.add(FRAIS_LIVRAISON).subtract(remise);

        // Création de la commande
        Order order = Order.builder()
                .customer(customer)
                .numeroCommande(generateOrderNumber())
                .statut(OrderStatus.PENDING)
                .adresseLivraison(address)
                .sousTotal(sousTotal)
                .fraisLivraison(FRAIS_LIVRAISON)
                .remise(remise)
                .totalTTC(total)
                .couponCode(cart.getCouponCode())
                .build();

        // Conversion CartItems → OrderItems + décrément stock
        List<OrderItem> orderItems = cart.getLignes().stream().map(cartItem -> {
            Product p = cartItem.getProduct();
            p.setStock(p.getStock() - cartItem.getQuantite());
            productRepository.save(p);

            BigDecimal pu = p.getPrixPromo() != null ? p.getPrixPromo() : p.getPrix();
            return OrderItem.builder()
                    .order(order)
                    .product(p)
                    .variant(cartItem.getVariant())
                    .quantite(cartItem.getQuantite())
                    .prixUnitaire(pu)
                    .build();
        }).collect(Collectors.toList());

        order.getLignes().addAll(orderItems);
        Order saved = orderRepository.save(order);

        // Vider le panier
        cart.getLignes().clear();
        cart.setCouponCode(null);
        cartService.getOrCreateCart(customerId);

        log.info("Order {} created for customer {}", saved.getNumeroCommande(), customerId);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public OrderResponse getById(Long id, Long requesterId, String role) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Commande", id));
        boolean isAdmin = role.contains("ADMIN");
        boolean isSeller = role.contains("SELLER");
        boolean isOwner = order.getCustomer().getId().equals(requesterId);
        if (!isAdmin && !isSeller && !isOwner) {
            throw new BusinessException("Accès refusé à cette commande", HttpStatus.FORBIDDEN);
        }
        return toResponse(order);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getMyOrders(Long customerId, Pageable pageable) {
        return orderRepository.findByCustomerIdOrderByDateCommandeDesc(customerId, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getSellerOrders(Long sellerId, Pageable pageable) {
        return orderRepository.findOrdersBySeller(sellerId, pageable).map(this::toResponse);
    }

    @Transactional
    public OrderResponse updateStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Commande", orderId));
        order.setStatut(newStatus);
        return toResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse cancel(Long orderId, Long customerId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Commande", orderId));

        if (!order.getCustomer().getId().equals(customerId)) {
            throw new BusinessException("Cette commande ne vous appartient pas", HttpStatus.FORBIDDEN);
        }
        if (order.getStatut() != OrderStatus.PENDING && order.getStatut() != OrderStatus.PAID) {
            throw new BusinessException("Impossible d'annuler une commande avec le statut : " + order.getStatut(), HttpStatus.BAD_REQUEST);
        }

        // Remboursement du stock
        order.getLignes().forEach(item -> {
            Product p = item.getProduct();
            p.setStock(p.getStock() + item.getQuantite());
            productRepository.save(p);
        });

        order.setStatut(OrderStatus.CANCELLED);
        return toResponse(orderRepository.save(order));
    }

    private String generateOrderNumber() {
        return "ORD-" + Year.now().getValue() + "-" +
                String.format("%05d", new Random().nextInt(99999));
    }

    public OrderResponse toResponse(Order o) {
        return orderMapper.toResponse(o);
    }
}
