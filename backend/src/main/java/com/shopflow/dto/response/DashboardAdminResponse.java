package com.shopflow.dto.response;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
@Data @Builder
public class DashboardAdminResponse {
    private BigDecimal chiffreAffairesGlobal;
    private Long totalCommandes;
    private Long commandesEnAttente;
    private Long totalUtilisateurs;
    private List<ProductResponse> topProduits;
    private List<OrderResponse> commandesRecentes;
}
