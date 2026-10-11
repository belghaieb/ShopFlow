package com.shopflow.dto.response;
import com.shopflow.enums.Role;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
@Data @Builder
public class UserResponse {
    private Long id;
    private String email;
    private String prenom;
    private String nom;
    private Role role;
    private boolean actif;
    private LocalDateTime dateCreation;
}
