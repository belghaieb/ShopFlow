package com.shopflow.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data @Builder
public class DashboardCustomerResponse {
    private long totalCommandes;
    private long commandesEnCours;
    private List<OrderResponse> commandesRecentes;
    private List<ReviewResponse> derniersAvis;
}
