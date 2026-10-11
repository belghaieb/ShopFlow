package com.shopflow.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AddCartItemRequest {
    @NotNull private Long productId;
    private Long variantId;
    @Min(1) @NotNull private Integer quantite;
}
