package com.shopflow.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReviewRequest {
    @NotNull private Long productId;
    @Min(1) @Max(5) @NotNull private Integer note;
    private String commentaire;
}
