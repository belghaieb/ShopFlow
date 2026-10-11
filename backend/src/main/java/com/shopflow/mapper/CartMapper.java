package com.shopflow.mapper;

import com.shopflow.dto.response.CartItemResponse;
import com.shopflow.dto.response.CartResponse;
import com.shopflow.entity.Cart;
import com.shopflow.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class CartMapper {

    private final CouponRepository couponRepository;
    private static final BigDecimal FRAIS_LIVRAISON = new BigDecimal("5.00");

    public CartResponse toResponse(Cart cart) {
        BigDecimal sousTotal = cart.getLignes().stream()
                .map(i -> {
                    BigDecimal prix = i.getProduct().getPrixPromo() != null
                            ? i.getProduct().getPrixPromo() : i.getProduct().getPrix();
                    if (i.getVariant() != null && i.getVariant().getPrixDelta() != null) {
                        prix = prix.add(i.getVariant().getPrixDelta());
                    }
                    return prix.multiply(BigDecimal.valueOf(i.getQuantite()));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal remise = BigDecimal.ZERO;
        if (cart.getCouponCode() != null) {
            remise = couponRepository.findByCodeAndActifTrue(cart.getCouponCode())
                    .map(c -> c.getType().name().equals("PERCENT")
                            ? sousTotal.multiply(c.getValeur()).divide(BigDecimal.valueOf(100))
                            : c.getValeur())
                    .orElse(BigDecimal.ZERO);
        }

        BigDecimal total = sousTotal.add(FRAIS_LIVRAISON).subtract(remise);
        if (total.compareTo(BigDecimal.ZERO) < 0) total = BigDecimal.ZERO;

        List<CartItemResponse> lignes = cart.getLignes().stream().map(i -> {
            BigDecimal pu = i.getProduct().getPrixPromo() != null
                    ? i.getProduct().getPrixPromo() : i.getProduct().getPrix();
            String image = i.getProduct().getImages().isEmpty() ? null : i.getProduct().getImages().get(0);
            String variantInfo = i.getVariant() != null
                    ? i.getVariant().getAttribut() + ": " + i.getVariant().getValeur() : null;
            return CartItemResponse.builder()
                    .id(i.getId())
                    .productId(i.getProduct().getId())
                    .productNom(i.getProduct().getNom())
                    .productImage(image)
                    .variantId(i.getVariant() != null ? i.getVariant().getId() : null)
                    .variantInfo(variantInfo)
                    .quantite(i.getQuantite())
                    .prixUnitaire(pu)
                    .sousTotal(pu.multiply(BigDecimal.valueOf(i.getQuantite())))
                    .build();
        }).collect(Collectors.toList());

        return CartResponse.builder()
                .id(cart.getId())
                .lignes(lignes)
                .couponCode(cart.getCouponCode())
                .sousTotal(sousTotal)
                .fraisLivraison(FRAIS_LIVRAISON)
                .remise(remise)
                .totalTTC(total)
                .build();
    }
}
