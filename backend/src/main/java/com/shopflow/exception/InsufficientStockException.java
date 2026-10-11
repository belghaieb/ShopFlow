package com.shopflow.exception;

import org.springframework.http.HttpStatus;

public class InsufficientStockException extends BusinessException {
    public InsufficientStockException(String productName) {
        super("Stock insuffisant pour le produit : " + productName, HttpStatus.CONFLICT);
    }
}
