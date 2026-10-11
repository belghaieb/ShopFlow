package com.shopflow.service;

import com.shopflow.dto.request.CouponRequest;
import com.shopflow.dto.response.CouponResponse;
import com.shopflow.entity.Coupon;
import com.shopflow.exception.BusinessException;
import com.shopflow.exception.ResourceNotFoundException;
import com.shopflow.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;

    @Transactional(readOnly = true)
    public List<CouponResponse> getAll() {
        return couponRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public CouponResponse create(CouponRequest request) {
        Coupon coupon = Coupon.builder()
                .code(request.getCode().toUpperCase()).type(request.getType())
                .valeur(request.getValeur()).dateExpiration(request.getDateExpiration())
                .usagesMax(request.getUsagesMax() != null ? request.getUsagesMax() : 100).build();
        return toResponse(couponRepository.save(coupon));
    }

    @Transactional
    public CouponResponse update(Long id, CouponRequest request) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", id));
        coupon.setCode(request.getCode().toUpperCase());
        coupon.setType(request.getType());
        coupon.setValeur(request.getValeur());
        coupon.setDateExpiration(request.getDateExpiration());
        if (request.getUsagesMax() != null) coupon.setUsagesMax(request.getUsagesMax());
        return toResponse(couponRepository.save(coupon));
    }

    @Transactional
    public void delete(Long id) {
        couponRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Coupon", id));
        couponRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public CouponResponse validate(String code) {
        return couponRepository.findByCodeAndActifTrue(code.toUpperCase())
                .map(this::toResponse)
                .orElseThrow(() -> new BusinessException("Code promo invalide", HttpStatus.NOT_FOUND));
    }

    private CouponResponse toResponse(Coupon c) {
        return CouponResponse.builder()
                .id(c.getId()).code(c.getCode()).type(c.getType()).valeur(c.getValeur())
                .dateExpiration(c.getDateExpiration()).usagesMax(c.getUsagesMax())
                .usagesActuels(c.getUsagesActuels()).actif(c.isActif()).build();
    }
}
