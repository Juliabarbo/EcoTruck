package com.ecotruck.controller;

import com.ecotruck.dto.request.ConfirmDisposalRequest;
import com.ecotruck.dto.request.CreateTripRequest;
import com.ecotruck.dto.request.StartTripRequest;
import com.ecotruck.dto.response.TripResponse;
import com.ecotruck.model.User;
import com.ecotruck.service.TripService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/trips")
public class TripController {

    private final TripService tripService;

    public TripController(TripService tripService) {
        this.tripService = tripService;
    }

    @PostMapping("/")
    public ResponseEntity<TripResponse> createTrip(
            @RequestBody CreateTripRequest request,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tripService.createTrip(request, user));
    }

    @PatchMapping("/{id}/start")
    public ResponseEntity<TripResponse> startTrip(
            @PathVariable Long id,
            @RequestBody StartTripRequest request,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(tripService.startTrip(id, request, user));
    }

    @PatchMapping("/{id}/confirm")
    public ResponseEntity<TripResponse> confirmDisposal(
            @PathVariable Long id,
            @RequestBody ConfirmDisposalRequest request,
            @AuthenticationPrincipal User user
    ) {
        ConfirmDisposalRequest confirmedRequest = new ConfirmDisposalRequest(
                id,
                request.photoUrl(),
                request.qrCodeValidation(),
                request.latitude(),
                request.longitude()
        );
        return ResponseEntity.ok(tripService.confirmDisposal(confirmedRequest, user));
    }

    @GetMapping({"", "/"})
    public ResponseEntity<List<TripResponse>> getTrips(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(tripService.getTrips(user));
    }
}
