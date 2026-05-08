package com.ecotruck.repository;

import com.ecotruck.model.Trip;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TripRepository extends JpaRepository<Trip, Long> {

    List<Trip> findAllByDriverId(Long driverId);

    List<Trip> findAllByDriverCompanyId(Long companyId);

    Optional<Trip> findByIdAndDriverCompanyId(Long id, Long companyId);
}
