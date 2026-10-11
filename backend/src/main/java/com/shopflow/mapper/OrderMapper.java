package com.shopflow.mapper;

import com.shopflow.dto.response.AddressResponse;
import com.shopflow.dto.response.OrderItemResponse;
import com.shopflow.dto.response.OrderResponse;
import com.shopflow.entity.Address;
import com.shopflow.entity.Order;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class OrderMapper {

    public OrderResponse toResponse(Order o) {
        List<OrderItemResponse> lignes = o.getLignes().stream().map(i -> {
            String image = i.getProduct().getImages().isEmpty() ? null : i.getProduct().getImages().get(0);
            String variantInfo = i.getVariant() != null
                    ? i.getVariant().getAttribut() + ": " + i.getVariant().getValeur() : null;
            return OrderItemResponse.builder()
                    .id(i.getId())
                    .productId(i.getProduct().getId())
                    .productNom(i.getProduct().getNom())
                    .productImage(image)
                    .variantInfo(variantInfo)
                    .quantite(i.getQuantite())
                    .prixUnitaire(i.getPrixUnitaire())
                    .sousTotal(i.getPrixUnitaire().multiply(BigDecimal.valueOf(i.getQuantite())))
                    .build();
        }).collect(Collectors.toList());

        AddressResponse adresse = null;
        if (o.getAdresseLivraison() != null) {
            Address a = o.getAdresseLivraison();
            adresse = AddressResponse.builder()
                    .id(a.getId()).rue(a.getRue()).ville(a.getVille())
                    .codePostal(a.getCodePostal()).pays(a.getPays()).build();
        }

        return OrderResponse.builder()
                .id(o.getId())
                .numeroCommande(o.getNumeroCommande())
                .statut(o.getStatut())
                .adresseLivraison(adresse)
                .sousTotal(o.getSousTotal())
                .fraisLivraison(o.getFraisLivraison())
                .remise(o.getRemise())
                .totalTTC(o.getTotalTTC())
                .couponCode(o.getCouponCode())
                .dateCommande(o.getDateCommande())
                .lignes(lignes)
                .customerNom(o.getCustomer().getPrenom() + " " + o.getCustomer().getNom())
                .customerEmail(o.getCustomer().getEmail())
                .build();
    }
}
