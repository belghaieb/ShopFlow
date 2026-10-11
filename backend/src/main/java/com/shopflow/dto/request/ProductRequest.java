package com.shopflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

@Data
public class ProductRequest {
    @NotBlank private String nom;
    private String description;
    @NotNull private BigDecimal prix;
    private BigDecimal prixPromo;
    @PositiveOrZero private Integer stock = 0;
    private Set<Long> categorieIds;
    private List<String> images;
}
