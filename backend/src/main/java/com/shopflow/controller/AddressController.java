package com.shopflow.controller;

import com.shopflow.dto.request.AddressRequest;
import com.shopflow.dto.response.AddressResponse;
import com.shopflow.entity.Address;
import com.shopflow.entity.User;
import com.shopflow.exception.ResourceNotFoundException;
import com.shopflow.repository.UserRepository;
import com.shopflow.security.UserDetailsImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
@Tag(name = "Adresses")
public class AddressController {

    private final UserRepository userRepository;

    @GetMapping
    @Operation(summary = "Adresses du client connecté")
    public ResponseEntity<List<AddressResponse>> getAll(@AuthenticationPrincipal UserDetailsImpl user) {
        User u = userRepository.findById(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", user.getId()));
        List<AddressResponse> list = u.getAdresses().stream().map(this::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @PostMapping
    @Operation(summary = "Ajouter une adresse")
    public ResponseEntity<AddressResponse> create(
            @Valid @RequestBody AddressRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", userDetails.getId()));

        // If principal=true, reset others
        if (request.isPrincipal()) {
            user.getAdresses().forEach(a -> a.setPrincipal(false));
        }

        Address address = Address.builder()
                .user(user)
                .rue(request.getRue())
                .ville(request.getVille())
                .codePostal(request.getCodePostal())
                .pays(request.getPays())
                .principal(request.isPrincipal())
                .build();

        user.getAdresses().add(address);
        userRepository.save(user);

        // Return the newly created address (last in list)
        Address saved = user.getAdresses().get(user.getAdresses().size() - 1);
        return ResponseEntity.status(201).body(toResponse(saved));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer une adresse")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", userDetails.getId()));
        boolean removed = user.getAdresses().removeIf(a -> a.getId().equals(id));
        if (!removed) throw new ResourceNotFoundException("Adresse", id);
        userRepository.save(user);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/primary")
    @Operation(summary = "Définir une adresse comme principale")
    public ResponseEntity<AddressResponse> setPrimary(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", userDetails.getId()));
        user.getAdresses().forEach(a -> a.setPrincipal(a.getId().equals(id)));
        userRepository.save(user);
        Address primary = user.getAdresses().stream()
                .filter(a -> a.getId().equals(id)).findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Adresse", id));
        return ResponseEntity.ok(toResponse(primary));
    }

    private AddressResponse toResponse(Address a) {
        return AddressResponse.builder()
                .id(a.getId()).rue(a.getRue()).ville(a.getVille())
                .codePostal(a.getCodePostal()).pays(a.getPays())
                .principal(a.isPrincipal()).build();
    }
}
