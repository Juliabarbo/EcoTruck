package com.ecotruck.service;

import com.ecotruck.dto.request.ConfirmDisposalRequest;
import com.ecotruck.dto.request.CreateTripRequest;
import com.ecotruck.dto.request.StartTripRequest;
import com.ecotruck.dto.response.TripResponse;
import com.ecotruck.model.Trip;
import com.ecotruck.model.User;
import com.ecotruck.model.enums.Role;
import com.ecotruck.model.enums.TripStatus;
import com.ecotruck.repository.TripRepository;
import com.ecotruck.repository.UserRepository;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class TripService {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;

    public TripService(TripRepository tripRepository, UserRepository userRepository) {
        this.tripRepository = tripRepository;
        this.userRepository = userRepository;
    }

    public TripResponse createTrip(CreateTripRequest request, User driver) {
        User persistedDriver = userRepository.findById(driver.getId())
                .orElseThrow(() -> new RuntimeException("Motorista nao encontrado"));

        Trip trip = new Trip();
        trip.setDriver(persistedDriver);
        trip.setOrigin(request.origin());
        trip.setDestination(request.destination());
        trip.setMaterialType(request.materialType());
        trip.setEstimatedWeight(request.estimatedWeight());
        trip.setStatus(TripStatus.PENDING);
        trip = tripRepository.save(trip);

        return toResponse(trip);
    }

    public TripResponse startTrip(Long tripId, StartTripRequest request, User driver) {
        Trip trip = tripRepository.findById(tripId)
                .filter(foundTrip -> foundTrip.getDriver().getId().equals(driver.getId()))
                .orElseThrow(() -> new RuntimeException("Viagem nao encontrada"));

        trip.setLatitudeInicio(requireCoordinate(request.latitude(), "Latitude inicial"));
        trip.setLongitudeInicio(requireCoordinate(request.longitude(), "Longitude inicial"));
        trip.setStatus(TripStatus.IN_PROGRESS);
        trip.setStartedAt(LocalDateTime.now());

        return toResponse(tripRepository.save(trip));
    }

    public TripResponse confirmDisposal(ConfirmDisposalRequest request, User driver) {
        Trip trip = tripRepository.findById(request.tripId())
                .filter(foundTrip -> foundTrip.getDriver().getId().equals(driver.getId()))
                .orElseThrow(() -> new RuntimeException("Viagem nao encontrada"));

        if (trip.getStatus() != TripStatus.IN_PROGRESS) {
            throw new RuntimeException("A viagem precisa estar em andamento para confirmar o descarte");
        }

        validateConfirmationRequest(request);

        trip.setPhotoUrl(request.photoUrl());
        trip.setQrCodeValidation(request.qrCodeValidation());
        trip.setLatitudeConfirmacao(request.latitude());
        trip.setLongitudeConfirmacao(request.longitude());
        trip.setStatus(TripStatus.COMPLETED);
        trip.setCompletedAt(LocalDateTime.now());

        return toResponse(tripRepository.save(trip));
    }

    public TripResponse confirmDisposalWithPhoto(
            Long tripId,
            String qrCodeValidation,
            MultipartFile photo,
            String simulatedPhotoName,
            User driver
    ) {
        Trip trip = tripRepository.findById(tripId)
                .filter(foundTrip -> foundTrip.getDriver().getId().equals(driver.getId()))
                .orElseThrow(() -> new RuntimeException("Viagem nao encontrada"));

        if (trip.getStatus() != TripStatus.IN_PROGRESS && trip.getStatus() != TripStatus.PENDING) {
            throw new RuntimeException("A viagem precisa estar pendente ou em andamento para confirmar o descarte");
        }

        if (qrCodeValidation == null || qrCodeValidation.isBlank()) {
            throw new RuntimeException("QR Code e obrigatorio");
        }

        String photoUrl = saveDisposalPhoto(photo, simulatedPhotoName);

        trip.setPhotoUrl(photoUrl);
        trip.setQrCodeValidation(qrCodeValidation);
        trip.setStatus(TripStatus.COMPLETED);
        trip.setCompletedAt(LocalDateTime.now());

        if (trip.getStartedAt() == null) {
            trip.setStartedAt(LocalDateTime.now());
        }

        return toResponse(tripRepository.save(trip));
    }

    public List<TripResponse> getDriverTrips(User driver) {
        return tripRepository.findAllByDriverId(driver.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<TripResponse> getTrips(User user) {
        if (user.getRole() == Role.ADMIN) {
            return getAllCompanyTrips(user);
        }

        return getDriverTrips(user);
    }

    public List<TripResponse> getAllCompanyTrips(User admin) {
        return tripRepository.findAllByDriverCompanyId(admin.getCompany().getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private TripResponse toResponse(Trip trip) {
        return new TripResponse(
                trip.getId(),
                trip.getDriver().getName(),
                trip.getOrigin(),
                trip.getDestination(),
                trip.getMaterialType(),
                trip.getEstimatedWeight(),
                trip.getStatus(),
                trip.getPhotoUrl(),
                trip.getQrCodeValidation(),
                trip.getLatitudeInicio(),
                trip.getLongitudeInicio(),
                trip.getLatitudeConfirmacao(),
                trip.getLongitudeConfirmacao(),
                trip.getDistanceFromDestination(),
                trip.getStartedAt(),
                trip.getCompletedAt()
        );
    }

    private void validateConfirmationRequest(ConfirmDisposalRequest request) {
        if (request.photoUrl() == null || request.qrCodeValidation() == null) {
            throw new RuntimeException("Foto e QR Code sao obrigatorios");
        }

        requireCoordinate(request.latitude(), "Latitude da confirmacao");
        requireCoordinate(request.longitude(), "Longitude da confirmacao");
    }

    private Double requireCoordinate(Double value, String fieldName) {
        if (value == null) {
            throw new RuntimeException(fieldName + " obrigatoria");
        }
        return value;
    }

    private String saveDisposalPhoto(MultipartFile photo, String simulatedPhotoName) {
        if ((photo == null || photo.isEmpty()) && (simulatedPhotoName == null || simulatedPhotoName.isBlank())) {
            throw new RuntimeException("Foto do descarte e obrigatoria");
        }

        try {
            Path uploadDirectory = Paths.get("uploads");
            Files.createDirectories(uploadDirectory);

            if (photo == null || photo.isEmpty()) {
                String filename = UUID.randomUUID() + "-" + simulatedPhotoName.replaceAll("[^a-zA-Z0-9._-]", "_");
                Path destination = uploadDirectory.resolve(filename);
                Files.writeString(destination, "Foto simulada do descarte");

                return "uploads/" + filename;
            }

            String originalFilename = photo.getOriginalFilename();
            String extension = "";

            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String filename = UUID.randomUUID() + extension;
            Path destination = uploadDirectory.resolve(filename);
            photo.transferTo(destination.toFile());

            return "uploads/" + filename;
        } catch (IOException exception) {
            throw new RuntimeException("Nao foi possivel salvar a foto do descarte");
        }
    }

}
