package com.shopflow.mapper;

import com.shopflow.dto.response.CategoryResponse;
import com.shopflow.dto.response.ProductResponse;
import com.shopflow.dto.response.VariantResponse;
import com.shopflow.entity.Product;
import com.shopflow.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ProductMapper {

    private final ReviewRepository reviewRepository;

    public ProductResponse toResponse(Product p) {
        Double noteMoyenne = reviewRepository.averageNoteByProductId(p.getId());
        long nombreAvis = p.getAvis().stream().filter(r -> r.isApprouve()).count();

        Set<CategoryResponse> cats = p.getCategories().stream()
                .map(c -> CategoryResponse.builder()
                        .id(c.getId()).nom(c.getNom()).description(c.getDescription()).build())
                .collect(Collectors.toSet());

        List<VariantResponse> variants = p.getVariantes().stream()
                .map(v -> VariantResponse.builder()
                        .id(v.getId()).attribut(v.getAttribut()).valeur(v.getValeur())
                        .stockSupplementaire(v.getStockSupplementaire())
                        .prixDelta(v.getPrixDelta()).build())
                .collect(Collectors.toList());

        String nomBoutique = p.getSeller().getSellerProfile() != null
                ? p.getSeller().getSellerProfile().getNomBoutique() : null;

        return ProductResponse.builder()
                .id(p.getId())
                .sellerId(p.getSeller().getId())
                .sellerNom(p.getSeller().getPrenom() + " " + p.getSeller().getNom())
                .nomBoutique(nomBoutique)
                .nom(p.getNom())
                .description(p.getDescription())
                .prix(p.getPrix())
                .prixPromo(p.getPrixPromo())
                .stock(p.getStock())
                .actif(p.isActif())
                .dateCreation(p.getDateCreation())
                .categories(cats)
                .images(p.getImages())
                .variantes(variants)
                .noteMoyenne(noteMoyenne)
                .nombreAvis(nombreAvis)
                .build();
    }
}
