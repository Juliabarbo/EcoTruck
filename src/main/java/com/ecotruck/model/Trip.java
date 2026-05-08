package com.ecotruck.model;

import com.ecotruck.model.enums.MaterialType;
import com.ecotruck.model.enums.TripStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "trips")
public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id")
    private User driver;

    private String origin;

    private String destination;

    @Enumerated(EnumType.STRING)
    private MaterialType materialType;

    private Double estimatedWeight;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    private TripStatus status = TripStatus.PENDING;

    @Column(nullable = true)
    private String photoUrl;

    @Column(nullable = true)
    private String qrCodeValidation;

    @Column(nullable = true)
    private Double latitudeInicio;

    @Column(nullable = true)
    private Double longitudeInicio;

    @Column(nullable = true)
    private Double latitudeConfirmacao;

    @Column(nullable = true)
    private Double longitudeConfirmacao;

    @Column(nullable = true)
    private Double distanceFromDestination;

    @Column(nullable = true)
    private LocalDateTime startedAt;

    @Column(nullable = true)
    private LocalDateTime completedAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getDriver() {
        return driver;
    }

    public void setDriver(User driver) {
        this.driver = driver;
    }

    public String getOrigin() {
        return origin;
    }

    public void setOrigin(String origin) {
        this.origin = origin;
    }

    public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public MaterialType getMaterialType() {
        return materialType;
    }

    public void setMaterialType(MaterialType materialType) {
        this.materialType = materialType;
    }

    public Double getEstimatedWeight() {
        return estimatedWeight;
    }

    public void setEstimatedWeight(Double estimatedWeight) {
        this.estimatedWeight = estimatedWeight;
    }

    public TripStatus getStatus() {
        return status;
    }

    public void setStatus(TripStatus status) {
        this.status = status;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public String getQrCodeValidation() {
        return qrCodeValidation;
    }

    public void setQrCodeValidation(String qrCodeValidation) {
        this.qrCodeValidation = qrCodeValidation;
    }

    public Double getLatitudeInicio() {
        return latitudeInicio;
    }

    public void setLatitudeInicio(Double latitudeInicio) {
        this.latitudeInicio = latitudeInicio;
    }

    public Double getLongitudeInicio() {
        return longitudeInicio;
    }

    public void setLongitudeInicio(Double longitudeInicio) {
        this.longitudeInicio = longitudeInicio;
    }

    public Double getLatitudeConfirmacao() {
        return latitudeConfirmacao;
    }

    public void setLatitudeConfirmacao(Double latitudeConfirmacao) {
        this.latitudeConfirmacao = latitudeConfirmacao;
    }

    public Double getLongitudeConfirmacao() {
        return longitudeConfirmacao;
    }

    public void setLongitudeConfirmacao(Double longitudeConfirmacao) {
        this.longitudeConfirmacao = longitudeConfirmacao;
    }

    public Double getDistanceFromDestination() {
        return distanceFromDestination;
    }

    public void setDistanceFromDestination(Double distanceFromDestination) {
        this.distanceFromDestination = distanceFromDestination;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
