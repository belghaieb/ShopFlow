package com.shopflow.dto.response;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
@Data @Builder
public class CartResponse {
    private Long id;
    private List<CartItemResponse> lignes;
    private String couponCode;
    private BigDecimal sousTotal;
    private BigDecimal fraisLivraison;
    private BigDecimal remise;
    private BigDecimal totalTTC;
}
