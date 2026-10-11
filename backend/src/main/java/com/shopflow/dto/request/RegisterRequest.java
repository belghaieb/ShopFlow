package com.shopflow.dto.request;

import com.shopflow.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @Email @NotBlank
    private String email;

    @NotBlank @Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caractères")
    private String motDePasse;

    @NotBlank private String prenom;
    @NotBlank private String nom;

    @NotNull
    private Role role;

    // Pour les vendeurs
    private String nomBoutique;
    private String descriptionBoutique;
}
