package com.shopflow.repository;

import com.shopflow.entity.Product;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ProductSpecification {

    public static Specification<Product> withFilters(
            String categorie, BigDecimal prixMin, BigDecimal prixMax,
            Boolean promo, Long sellerId) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isTrue(root.get("actif")));

            if (categorie != null && !categorie.isBlank()) {
                predicates.add(cb.equal(
                    root.join("categories").get("nom"), categorie));
            }
            if (prixMin != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("prix"), prixMin));
            }
            if (prixMax != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("prix"), prixMax));
            }
            if (Boolean.TRUE.equals(promo)) {
                predicates.add(cb.isNotNull(root.get("prixPromo")));
            }
            if (sellerId != null) {
                predicates.add(cb.equal(root.get("seller").get("id"), sellerId));
            }
            query.distinct(true);
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
