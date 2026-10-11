package com.shopflow.dto.response;
import lombok.Data;
import java.time.LocalDateTime;
@Data
public class ErrorResponse {
    private String code;
    private Object message;
    private LocalDateTime timestamp = LocalDateTime.now();
    public ErrorResponse(String code, Object message) {
        this.code = code;
        this.message = message;
    }
}
