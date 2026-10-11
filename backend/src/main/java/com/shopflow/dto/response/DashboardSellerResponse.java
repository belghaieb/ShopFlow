package com.shopflow.dto.response;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
@Data @Builder
public class DashboardSellerResponse {
    private BigDecimal revenus;
    private Long commandesEnAttente;
    private Long totalProduits;
    private List<ProductResponse> alertesStockFaible;
    private List<OrderResponse> commandesRecentes;
}
