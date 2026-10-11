package com.shopflow.dto.response;
import com.shopflow.enums.Role;
import lombok.Builder;
import lombok.Data;
@Data @Builder
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private Long userId;
    private String email;
    private String prenom;
    private String nom;
    private Role role;
}
