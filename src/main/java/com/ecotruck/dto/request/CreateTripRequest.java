package com.ecotruck.dto.request;

import com.ecotruck.model.enums.MaterialType;

public record CreateTripRequest(
        String origin,
        String destination,
        MaterialType materialType,
        Double estimatedWeight
) {
}
