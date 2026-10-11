package com.shopflow.controller;

import com.shopflow.dto.request.AddCartItemRequest;
import com.shopflow.dto.request.UpdateCartItemRequest;
import com.shopflow.dto.response.CartResponse;
import com.shopflow.security.UserDetailsImpl;
import com.shopflow.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
@Tag(name = "Panier")
public class CartController {

    private final CartService cartService;

    @GetMapping
    @Operation(summary = "Panier du client connecté")
    public ResponseEntity<CartResponse> getCart(@AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(cartService.getCart(user.getId()));
    }

    @PostMapping("/items")
    @Operation(summary = "Ajouter un article au panier")
    public ResponseEntity<CartResponse> addItem(
            @Valid @RequestBody AddCartItemRequest request,
            @AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(cartService.addItem(user.getId(), request));
    }

    @PutMapping("/items/{itemId}")
    @Operation(summary = "Modifier la quantité d'un article")
    public ResponseEntity<CartResponse> updateItem(
            @PathVariable Long itemId,
            @Valid @RequestBody UpdateCartItemRequest request,
            @AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(cartService.updateItem(user.getId(), itemId, request));
    }

    @DeleteMapping("/items/{itemId}")
    @Operation(summary = "Retirer un article du panier")
    public ResponseEntity<CartResponse> removeItem(
            @PathVariable Long itemId,
            @AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(cartService.removeItem(user.getId(), itemId));
    }

    @PostMapping("/coupon")
    @Operation(summary = "Appliquer un code promo")
    public ResponseEntity<CartResponse> applyCoupon(
            @RequestParam String code,
            @AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(cartService.applyCoupon(user.getId(), code));
    }

    @DeleteMapping("/coupon")
    @Operation(summary = "Retirer le code promo")
    public ResponseEntity<CartResponse> removeCoupon(@AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(cartService.removeCoupon(user.getId()));
    }
}
