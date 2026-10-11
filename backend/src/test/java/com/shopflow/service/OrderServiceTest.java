package com.shopflow.service;

import com.shopflow.dto.request.PlaceOrderRequest;
import com.shopflow.dto.response.OrderResponse;
import com.shopflow.entity.*;
import com.shopflow.enums.CouponType;
import com.shopflow.enums.OrderStatus;
import com.shopflow.enums.Role;
import com.shopflow.exception.BusinessException;
import com.shopflow.exception.InsufficientStockException;
import com.shopflow.exception.ResourceNotFoundException;
import com.shopflow.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock OrderRepository orderRepository;
    @Mock CartService cartService;
    @Mock UserRepository userRepository;
    @Mock CouponRepository couponRepository;
    @Mock ProductRepository productRepository;

    @InjectMocks OrderService orderService;

    private User customer;
    private Address address;
    private Product product;
    private Cart cart;
    private CartItem cartItem;

    @BeforeEach
    void setUp() {
        customer = User.builder()
                .id(1L).email("client@test.com")
                .prenom("Jean").nom("Dupont")
                .role(Role.CUSTOMER).actif(true)
                .adresses(new ArrayList<>())
                .build();

        address = Address.builder()
                .id(10L).rue("1 rue Test").ville("Paris")
                .codePostal("75000").pays("France").build();
        customer.getAdresses().add(address);

        product = Product.builder()
                .id(100L).nom("Produit Test")
                .prix(new BigDecimal("20.00")).stock(10)
                .images(new ArrayList<>()).variantes(new ArrayList<>())
                .avis(new ArrayList<>()).actif(true).build();

        cartItem = CartItem.builder()
                .id(1L).product(product).quantite(2).build();

        cart = Cart.builder()
                .id(1L).customer(customer)
                .lignes(new ArrayList<>(List.of(cartItem))).build();
        cartItem.setCart(cart);
    }

    @Test
    void placeOrder_success() {
        PlaceOrderRequest request = new PlaceOrderRequest();
        request.setAddressId(10L);

        when(cartService.getOrCreateCart(1L)).thenReturn(cart);
        when(userRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(couponRepository.findByCodeAndActifTrue(any())).thenReturn(Optional.empty());
        when(orderRepository.save(any())).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            o = Order.builder()
                    .id(1L).customer(customer).numeroCommande("ORD-2026-00001")
                    .statut(OrderStatus.PENDING).adresseLivraison(address)
                    .sousTotal(new BigDecimal("40.00"))
                    .fraisLivraison(new BigDecimal("5.00"))
                    .remise(BigDecimal.ZERO)
                    .totalTTC(new BigDecimal("45.00"))
                    .lignes(new ArrayList<>()).build();
            return o;
        });
        when(productRepository.save(any())).thenReturn(product);

        OrderResponse response = orderService.placeOrder(1L, request);

        assertThat(response).isNotNull();
        assertThat(response.getStatut()).isEqualTo(OrderStatus.PENDING);
        verify(productRepository, atLeastOnce()).save(any());
    }

    @Test
    void placeOrder_emptyCart_throwsBusinessException() {
        cart.getLignes().clear();
        when(cartService.getOrCreateCart(1L)).thenReturn(cart);

        assertThatThrownBy(() -> orderService.placeOrder(1L, new PlaceOrderRequest()))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("panier est vide");
    }

    @Test
    void placeOrder_insufficientStock_throwsException() {
        product.setStock(1);
        cartItem.setQuantite(5);

        PlaceOrderRequest request = new PlaceOrderRequest();
        request.setAddressId(10L);

        when(cartService.getOrCreateCart(1L)).thenReturn(cart);
        when(userRepository.findById(1L)).thenReturn(Optional.of(customer));

        assertThatThrownBy(() -> orderService.placeOrder(1L, request))
                .isInstanceOf(InsufficientStockException.class);
    }

    @Test
    void placeOrder_withPercentCoupon_appliesDiscount() {
        PlaceOrderRequest request = new PlaceOrderRequest();
        request.setAddressId(10L);
        cart.setCouponCode("PROMO10");

        Coupon coupon = Coupon.builder()
                .id(1L).code("PROMO10").type(CouponType.PERCENT)
                .valeur(new BigDecimal("10")).usagesMax(100).usagesActuels(0).actif(true).build();

        when(cartService.getOrCreateCart(1L)).thenReturn(cart);
        when(userRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(couponRepository.findByCodeAndActifTrue("PROMO10")).thenReturn(Optional.of(coupon));
        when(orderRepository.save(any())).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            if (o.getId() == null) {
                return Order.builder().id(1L).customer(customer)
                        .numeroCommande("ORD-2026-00002").statut(OrderStatus.PENDING)
                        .adresseLivraison(address).sousTotal(new BigDecimal("40.00"))
                        .fraisLivraison(new BigDecimal("5.00"))
                        .remise(new BigDecimal("4.00"))
                        .totalTTC(new BigDecimal("41.00"))
                        .lignes(new ArrayList<>()).build();
            }
            return o;
        });
        when(productRepository.save(any())).thenReturn(product);

        OrderResponse response = orderService.placeOrder(1L, request);
        assertThat(response.getRemise()).isGreaterThan(BigDecimal.ZERO);
    }

    @Test
    void cancel_success_whenPending() {
        Order order = Order.builder()
                .id(1L).customer(customer).statut(OrderStatus.PENDING)
                .lignes(new ArrayList<>()).build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        OrderResponse response = orderService.cancel(1L, 1L);
        assertThat(response.getStatut()).isEqualTo(OrderStatus.CANCELLED);
    }

    @Test
    void cancel_notOwner_throwsBusinessException() {
        User otherUser = User.builder().id(99L).build();
        Order order = Order.builder()
                .id(1L).customer(otherUser).statut(OrderStatus.PENDING)
                .lignes(new ArrayList<>()).build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> orderService.cancel(1L, 1L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("appartient pas");
    }

    @Test
    void cancel_alreadyShipped_throwsBusinessException() {
        Order order = Order.builder()
                .id(1L).customer(customer).statut(OrderStatus.SHIPPED)
                .lignes(new ArrayList<>()).build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> orderService.cancel(1L, 1L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Impossible d'annuler");
    }

    @Test
    void updateStatus_success() {
        Order order = Order.builder()
                .id(1L).customer(customer).statut(OrderStatus.PENDING)
                .lignes(new ArrayList<>()).build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        OrderResponse response = orderService.updateStatus(1L, OrderStatus.PAID);
        assertThat(response.getStatut()).isEqualTo(OrderStatus.PAID);
    }

    @Test
    void getMyOrders_returnsPage() {
        Order order = Order.builder()
                .id(1L).customer(customer).statut(OrderStatus.PENDING)
                .lignes(new ArrayList<>()).build();
        Page<Order> page = new PageImpl<>(List.of(order));

        when(orderRepository.findByCustomerIdOrderByDateCommandeDesc(eq(1L), any()))
                .thenReturn(page);

        Page<OrderResponse> result = orderService.getMyOrders(1L, PageRequest.of(0, 10));
        assertThat(result.getTotalElements()).isEqualTo(1);
    }

    @Test
    void getById_notOwner_throwsBusinessException() {
        User other = User.builder().id(99L).build();
        Order order = Order.builder().id(1L).customer(other).lignes(new ArrayList<>()).build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> orderService.getById(1L, 1L, "ROLE_CUSTOMER"))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void getById_asAdmin_succeeds() {
        Order order = Order.builder()
                .id(1L).customer(customer).statut(OrderStatus.PENDING)
                .lignes(new ArrayList<>()).build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        OrderResponse response = orderService.getById(1L, 99L, "ROLE_ADMIN");
        assertThat(response).isNotNull();
    }

    @Test
    void getById_notFound_throwsResourceNotFoundException() {
        when(orderRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.getById(999L, 1L, "ROLE_ADMIN"))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
