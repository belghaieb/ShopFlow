package com.shopflow.controller;

import com.shopflow.dto.response.DashboardAdminResponse;
import com.shopflow.dto.response.DashboardCustomerResponse;
import com.shopflow.dto.response.DashboardSellerResponse;
import com.shopflow.security.UserDetailsImpl;
import com.shopflow.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Statistiques globales (ADMIN)")
    public ResponseEntity<DashboardAdminResponse> adminDashboard() {
        return ResponseEntity.ok(dashboardService.getAdminDashboard());
    }

    @GetMapping("/seller")
    @PreAuthorize("hasRole('SELLER')")
    @Operation(summary = "Statistiques du vendeur connecté")
    public ResponseEntity<DashboardSellerResponse> sellerDashboard(
            @AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(dashboardService.getSellerDashboard(user.getId()));
    }

    @GetMapping("/customer")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Tableau de bord du client connecté")
    public ResponseEntity<DashboardCustomerResponse> customerDashboard(
            @AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(dashboardService.getCustomerDashboard(user.getId()));
    }
}
