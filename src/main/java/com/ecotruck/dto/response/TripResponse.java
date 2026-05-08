package com.ecotruck.dto.response;

import com.ecotruck.model.enums.MaterialType;
import com.ecotruck.model.enums.TripStatus;
import java.time.LocalDateTime;

public record TripResponse(
        Long id,
        String driverName,
        String origin,
        String destination,
        MaterialType materialType,
        Double estimatedWeight,
        TripStatus status,
        String photoUrl,
        String qrCodeValidation,
        Double latitudeInicio,
        Double longitudeInicio,
        Double latitudeConfirmacao,
        Double longitudeConfirmacao,
        Double distanceFromDestination,
        LocalDateTime startedAt,
        LocalDateTime completedAt
) {
}
