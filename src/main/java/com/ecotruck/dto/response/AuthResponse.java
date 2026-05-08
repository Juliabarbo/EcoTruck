package com.ecotruck.dto.response;

import com.ecotruck.model.enums.Role;

public record AuthResponse(
        String token,
        String name,
        String email,
        Role role
) {
}
