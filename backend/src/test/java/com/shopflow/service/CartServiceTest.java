package com.shopflow.service;

import com.shopflow.dto.request.AddCartItemRequest;
import com.shopflow.dto.request.UpdateCartItemRequest;
import com.shopflow.dto.response.CartResponse;
import com.shopflow.entity.*;
import com.shopflow.enums.CouponType;
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

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock CartRepository cartRepository;
    @Mock UserRepository userRepository;
    @Mock ProductRepository productRepository;
    @Mock CouponRepository couponRepository;

    @InjectMocks CartService cartService;

    private User customer;
    private Product product;
    private Cart cart;

    @BeforeEach
    void setUp() {
        customer = User.builder()
                .id(1L).email("client@test.com")
                .prenom("Jean").nom("Dupont")
                .role(Role.CUSTOMER).actif(true).build();

        product = Product.builder()
                .id(100L).nom("Produit Test")
                .prix(new BigDecimal("20.00")).stock(10)
                .images(new ArrayList<>()).variantes(new ArrayList<>())
                .avis(new ArrayList<>()).actif(true).build();

        cart = Cart.builder()
                .id(1L).customer(customer)
                .lignes(new ArrayList<>()).build();
    }

    @Test
    void getOrCreateCart_existingCart_returnsIt() {
        when(cartRepository.findByCustomerId(1L)).thenReturn(Optional.of(cart));

        Cart result = cartService.getOrCreateCart(1L);
        assertThat(result.getId()).isEqualTo(1L);
        verify(cartRepository, never()).save(any());
    }

    @Test
    void getOrCreateCart_noCart_createsNew() {
        when(cartRepository.findByCustomerId(1L)).thenReturn(Optional.empty());
        when(userRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(cartRepository.save(any())).thenReturn(cart);

        Cart result = cartService.getOrCreateCart(1L);
        assertThat(result).isNotNull();
        verify(cartRepository).save(any());
    }

    @Test
    void addItem_newProduct_addsToCart() {
        AddCartItemRequest request = new AddCartItemRequest();
        request.setProductId(100L);
        request.setQuantite(2);

        when(cartRepository.findByCustomerId(1L)).thenReturn(Optional.of(cart));
        when(productRepository.findById(100L)).thenReturn(Optional.of(product));
        when(cartRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        CartResponse response = cartService.addItem(1L, request);
        assertThat(cart.getLignes()).hasSize(1);
        assertThat(cart.getLignes().get(0).getQuantite()).isEqualTo(2);
    }

    @Test
    void addItem_productInactive_throwsBusinessException() {
        product.setActif(false);
        AddCartItemRequest request = new AddCartItemRequest();
        request.setProductId(100L);
        request.setQuantite(1);

        when(cartRepository.findByCustomerId(1L)).thenReturn(Optional.of(cart));
        when(productRepository.findById(100L)).thenReturn(Optional.of(product));

        assertThatThrownBy(() -> cartService.addItem(1L, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("disponible");
    }

    @Test
    void addItem_insufficientStock_throwsException() {
        product.setStock(1);
        AddCartItemRequest request = new AddCartItemRequest();
        request.setProductId(100L);
        request.setQuantite(5);

        when(cartRepository.findByCustomerId(1L)).thenReturn(Optional.of(cart));
        when(productRepository.findById(100L)).thenReturn(Optional.of(product));

        assertThatThrownBy(() -> cartService.addItem(1L, request))
                .isInstanceOf(InsufficientStockException.class);
    }

    @Test
    void addItem_existingProduct_updatesQuantity() {
        CartItem existing = CartItem.builder()
                .id(1L).product(product).quantite(1).cart(cart).build();
        cart.getLignes().add(existing);

        AddCartItemRequest request = new AddCartItemRequest();
        request.setProductId(100L);
        request.setQuantite(2);

        when(cartRepository.findByCustomerId(1L)).thenReturn(Optional.of(cart));
        when(productRepository.findById(100L)).thenReturn(Optional.of(product));
        when(cartRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        cartService.addItem(1L, request);
        assertThat(existing.getQuantite()).isEqualTo(3);
    }

    @Test
    void updateItem_success() {
        CartItem item = CartItem.builder()
                .id(1L).product(product).quantite(1).cart(cart).build();
        cart.getLignes().add(item);

        UpdateCartItemRequest request = new UpdateCartItemRequest();
        request.setQuantite(3);

        when(cartRepository.findByCustomerId(1L)).thenReturn(Optional.of(cart));
        when(cartRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        cartService.updateItem(1L, 1L, request);
        assertThat(item.getQuantite()).isEqualTo(3);
    }

    @Test
    void updateItem_notFound_throwsException() {
        when(cartRepository.findByCustomerId(1L)).thenReturn(Optional.of(cart));

        UpdateCartItemRequest request = new UpdateCartItemRequest();
        request.setQuantite(2);

        assertThatThrownBy(() -> cartService.updateItem(1L, 999L, request))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void removeItem_success() {
        CartItem item = CartItem.builder()
                .id(1L).product(product).quantite(1).cart(cart).build();
        cart.getLignes().add(item);

        when(cartRepository.findByCustomerId(1L)).thenReturn(Optional.of(cart));
        when(cartRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        cartService.removeItem(1L, 1L);
        assertThat(cart.getLignes()).isEmpty();
    }

    @Test
    void applyCoupon_validCoupon_setsCouponCode() {
        Coupon coupon = Coupon.builder()
                .id(1L).code("SAVE10").type(CouponType.PERCENT)
                .valeur(new BigDecimal("10")).usagesMax(100).usagesActuels(0).actif(true).build();

        when(cartRepository.findByCustomerId(1L)).thenReturn(Optional.of(cart));
        when(couponRepository.findByCodeAndActifTrue("SAVE10")).thenReturn(Optional.of(coupon));
        when(cartRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        cartService.applyCoupon(1L, "SAVE10");
        assertThat(cart.getCouponCode()).isEqualTo("SAVE10");
    }

    @Test
    void applyCoupon_invalidCode_throwsException() {
        when(cartRepository.findByCustomerId(1L)).thenReturn(Optional.of(cart));
        when(couponRepository.findByCodeAndActifTrue("INVALID")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> cartService.applyCoupon(1L, "INVALID"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("invalide");
    }

    @Test
    void removeCoupon_clearsCouponCode() {
        cart.setCouponCode("SAVE10");

        when(cartRepository.findByCustomerId(1L)).thenReturn(Optional.of(cart));
        when(cartRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        cartService.removeCoupon(1L);
        assertThat(cart.getCouponCode()).isNull();
    }
}
