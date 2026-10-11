package com.shopflow.mapper;

import com.shopflow.dto.response.ReviewResponse;
import com.shopflow.entity.Review;
import org.springframework.stereotype.Component;

@Component
public class ReviewMapper {

    public ReviewResponse toResponse(Review r) {
        return ReviewResponse.builder()
                .id(r.getId())
                .productId(r.getProduct().getId())
                .customerNom(r.getCustomer().getPrenom() + " " + r.getCustomer().getNom())
                .note(r.getNote())
                .commentaire(r.getCommentaire())
                .dateCreation(r.getDateCreation())
                .approuve(r.isApprouve())
                .build();
    }
}
