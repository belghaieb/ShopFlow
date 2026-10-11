package com.shopflow.service;

import com.shopflow.dto.request.AddCartItemRequest;
import com.shopflow.dto.request.UpdateCartItemRequest;
import com.shopflow.dto.response.CartResponse;
import com.shopflow.mapper.CartMapper;
import com.shopflow.entity.*;
import com.shopflow.exception.BusinessException;
import com.shopflow.exception.InsufficientStockException;
import com.shopflow.exception.ResourceNotFoundException;
import com.shopflow.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartService {

    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CouponRepository couponRepository;
    private final CartMapper cartMapper;

    private static final BigDecimal FRAIS_LIVRAISON = new BigDecimal("5.00");

    @Transactional(readOnly = true)
    public CartResponse getCart(Long customerId) {
        Cart cart = getOrCreateCart(customerId);
        return toResponse(cart);
    }

    @Transactional
    public CartResponse addItem(Long customerId, AddCartItemRequest request) {
        Cart cart = getOrCreateCart(customerId);
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Produit", request.getProductId()));

        if (!product.isActif()) {
            throw new BusinessException("Ce produit n'est plus disponible", HttpStatus.BAD_REQUEST);
        }
        if (product.getStock() < request.getQuantite()) {
            throw new InsufficientStockException(product.getNom());
        }

        Optional<CartItem> existing = cart.getLignes().stream()
                .filter(i -> i.getProduct().getId().equals(request.getProductId())
                        && (request.getVariantId() == null || (i.getVariant() != null
                        && i.getVariant().getId().equals(request.getVariantId()))))
                .findFirst();

        if (existing.isPresent()) {
            CartItem item = existing.get();
            int newQty = item.getQuantite() + request.getQuantite();
            if (product.getStock() < newQty) throw new InsufficientStockException(product.getNom());
            item.setQuantite(newQty);
        } else {
            CartItem item = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantite(request.getQuantite())
                    .build();
            cart.getLignes().add(item);
        }

        return toResponse(cartRepository.save(cart));
    }

    @Transactional
    public CartResponse updateItem(Long customerId, Long itemId, UpdateCartItemRequest request) {
        Cart cart = getOrCreateCart(customerId);
        CartItem item = cart.getLignes().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Article de panier", itemId));

        if (item.getProduct().getStock() < request.getQuantite()) {
            throw new InsufficientStockException(item.getProduct().getNom());
        }
        item.setQuantite(request.getQuantite());
        return toResponse(cartRepository.save(cart));
    }

    @Transactional
    public CartResponse removeItem(Long customerId, Long itemId) {
        Cart cart = getOrCreateCart(customerId);
        cart.getLignes().removeIf(i -> i.getId().equals(itemId));
        return toResponse(cartRepository.save(cart));
    }

    @Transactional
    public CartResponse applyCoupon(Long customerId, String code) {
        Cart cart = getOrCreateCart(customerId);
        Coupon coupon = couponRepository.findByCodeAndActifTrue(code)
                .orElseThrow(() -> new BusinessException("Code promo invalide ou expiré", HttpStatus.BAD_REQUEST));

        if (coupon.getDateExpiration() != null && coupon.getDateExpiration().isBefore(java.time.LocalDateTime.now())) {
            throw new BusinessException("Code promo expiré", HttpStatus.BAD_REQUEST);
        }
        if (coupon.getUsagesActuels() >= coupon.getUsagesMax()) {
            throw new BusinessException("Code promo épuisé", HttpStatus.BAD_REQUEST);
        }

        cart.setCouponCode(code);
        return toResponse(cartRepository.save(cart));
    }

    @Transactional
    public CartResponse removeCoupon(Long customerId) {
        Cart cart = getOrCreateCart(customerId);
        cart.setCouponCode(null);
        return toResponse(cartRepository.save(cart));
    }

    public Cart getOrCreateCart(Long customerId) {
        return cartRepository.findByCustomerId(customerId).orElseGet(() -> {
            User customer = userRepository.findById(customerId)
                    .orElseThrow(() -> new ResourceNotFoundException("Client", customerId));
            Cart newCart = Cart.builder().customer(customer).build();
            return cartRepository.save(newCart);
        });
    }

    private CartResponse toResponse(Cart cart) {
        return cartMapper.toResponse(cart);
    }
}
