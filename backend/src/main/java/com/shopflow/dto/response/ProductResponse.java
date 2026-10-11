package com.shopflow.dto.response;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
@Data @Builder
public class ProductResponse {
    private Long id;
    private Long sellerId;
    private String sellerNom;
    private String nomBoutique;
    private String nom;
    private String description;
    private BigDecimal prix;
    private BigDecimal prixPromo;
    private Integer stock;
    private boolean actif;
    private LocalDateTime dateCreation;
    private Set<CategoryResponse> categories;
    private List<String> images;
    private List<VariantResponse> variantes;
    private Double noteMoyenne;
    private Long nombreAvis;
}
