package com.shopflow.dto.request;

import com.shopflow.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateOrderStatusRequest {
    @NotNull private OrderStatus statut;
}
