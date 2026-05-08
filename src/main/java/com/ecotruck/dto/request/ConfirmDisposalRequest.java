package com.ecotruck.dto.request;

public record ConfirmDisposalRequest(
        Long tripId,
        String photoUrl,
        String qrCodeValidation,
        Double latitude,
        Double longitude
) {
}
