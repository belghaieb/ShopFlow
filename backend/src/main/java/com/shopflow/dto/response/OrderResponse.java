package com.shopflow.dto.response;
import com.shopflow.enums.OrderStatus;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
@Data @Builder
public class OrderResponse {
    private Long id;
    private String numeroCommande;
    private OrderStatus statut;
    private AddressResponse adresseLivraison;
    private BigDecimal sousTotal;
    private BigDecimal fraisLivraison;
    private BigDecimal remise;
    private BigDecimal totalTTC;
    private String couponCode;
    private LocalDateTime dateCommande;
    private List<OrderItemResponse> lignes;
    private String customerNom;
    private String customerEmail;
}
