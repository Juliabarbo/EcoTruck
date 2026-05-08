package com.ecotruck.dto.request;

public record LoginRequest(
        String email,
        String password
) {
}
