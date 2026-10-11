package com.shopflow.service;

import com.shopflow.dto.response.CategoryResponse;
import com.shopflow.entity.Category;
import com.shopflow.exception.ResourceNotFoundException;
import com.shopflow.mapper.CategoryMapper;
import com.shopflow.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAll() {
        return categoryRepository.findByParentIsNull().stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public CategoryResponse create(String nom, String description, Long parentId) {
        Category category = Category.builder().nom(nom).description(description).build();
        if (parentId != null) {
            Category parent = categoryRepository.findById(parentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Catégorie", parentId));
            category.setParent(parent);
        }
        return toResponse(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse update(Long id, String nom, String description, Long parentId) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Catégorie", id));
        if (nom != null && !nom.isBlank()) category.setNom(nom);
        if (description != null) category.setDescription(description);
        if (parentId != null) {
            Category parent = categoryRepository.findById(parentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Catégorie parente", parentId));
            category.setParent(parent);
        } else {
            category.setParent(null);
        }
        return toResponse(categoryRepository.save(category));
    }

    @Transactional
    public void delete(Long id) {
        categoryRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Catégorie", id));
        categoryRepository.deleteById(id);
    }

    private CategoryResponse toResponse(Category c) {
        return categoryMapper.toResponse(c);
    }
}
