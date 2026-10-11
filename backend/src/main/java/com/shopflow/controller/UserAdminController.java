package com.shopflow.controller;

import com.shopflow.dto.response.UserResponse;
import com.shopflow.service.UserAdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Administration Utilisateurs")
public class UserAdminController {

    private final UserAdminService userAdminService;

    @GetMapping
    @Operation(summary = "Liste de tous les utilisateurs (ADMIN)")
    public ResponseEntity<Page<UserResponse>> getAll(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(userAdminService.getAll(pageable));
    }

    @PutMapping("/{id}/activate")
    @Operation(summary = "Activer un compte utilisateur (ADMIN)")
    public ResponseEntity<UserResponse> activate(@PathVariable Long id) {
        return ResponseEntity.ok(userAdminService.setActive(id, true));
    }

    @PutMapping("/{id}/deactivate")
    @Operation(summary = "Désactiver un compte utilisateur (ADMIN)")
    public ResponseEntity<UserResponse> deactivate(@PathVariable Long id) {
        return ResponseEntity.ok(userAdminService.setActive(id, false));
    }
}
