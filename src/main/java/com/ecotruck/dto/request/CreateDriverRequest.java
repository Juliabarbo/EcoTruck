package com.ecotruck.dto.request;

public record CreateDriverRequest(
        String name,
        String email,
        String password
) {
}
