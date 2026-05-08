package com.ecotruck.dto.response;

import com.ecotruck.model.enums.Role;

public record UserResponse(
        Long id,
        String name,
        String email,
        Role role,
        boolean active
) {
}
