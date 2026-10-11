package com.shopflow.dto.request;

import com.shopflow.enums.CouponType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CouponRequest {
    @NotBlank private String code;
    @NotNull private CouponType type;
    @NotNull private BigDecimal valeur;
    private LocalDateTime dateExpiration;
    private Integer usagesMax = 100;
}
