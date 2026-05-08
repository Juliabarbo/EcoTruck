package com.ecotruck.dto.request;

public record UpdateUserRequest(
        String name,
        String email
) {
}
