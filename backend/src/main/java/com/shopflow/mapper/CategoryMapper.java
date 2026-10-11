package com.shopflow.mapper;

import com.shopflow.dto.response.CategoryResponse;
import com.shopflow.entity.Category;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class CategoryMapper {

    public CategoryResponse toResponse(Category c) {
        List<CategoryResponse> sub = c.getSousCategories() != null
                ? c.getSousCategories().stream().map(this::toResponse).collect(Collectors.toList())
                : List.of();
        return CategoryResponse.builder()
                .id(c.getId())
                .nom(c.getNom())
                .description(c.getDescription())
                .parentId(c.getParent() != null ? c.getParent().getId() : null)
                .sousCategories(sub)
                .build();
    }
}
