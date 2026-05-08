package com.ecotruck.service;

import com.ecotruck.dto.request.CreateDriverRequest;
import com.ecotruck.dto.request.UpdateUserRequest;
import com.ecotruck.dto.response.UserResponse;
import com.ecotruck.model.Company;
import com.ecotruck.model.Trip;
import com.ecotruck.model.User;
import com.ecotruck.model.enums.Role;
import com.ecotruck.repository.CompanyRepository;
import com.ecotruck.repository.TripRepository;
import com.ecotruck.repository.UserRepository;
import java.util.List;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final TripRepository tripRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            CompanyRepository companyRepository,
            TripRepository tripRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;
        this.tripRepository = tripRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserResponse createDriver(CreateDriverRequest request, User admin) {
        if (userRepository.existsByEmail(request.email())) {
            throw new RuntimeException("Email ja cadastrado");
        }

        Company company = companyRepository.findById(admin.getCompany().getId())
                .orElseThrow(() -> new RuntimeException("Empresa nao encontrada"));

        User driver = new User();
        driver.setName(request.name());
        driver.setEmail(request.email());
        driver.setPassword(passwordEncoder.encode(request.password()));
        driver.setRole(Role.DRIVER);
        driver.setCompany(company);
        driver = userRepository.save(driver);

        return toResponse(driver);
    }

    public List<UserResponse> getAllDrivers(User admin) {
        return userRepository.findAllByCompanyId(admin.getCompany().getId())
                .stream()
                .filter(user -> user.getRole() == Role.DRIVER)
                .map(this::toResponse)
                .toList();
    }

    public UserResponse toggleDriverActive(Long driverId, User admin) {
        User driver = userRepository.findById(driverId)
                .filter(user -> user.getRole() == Role.DRIVER)
                .filter(user -> user.getCompany().getId().equals(admin.getCompany().getId()))
                .orElseThrow(() -> new RuntimeException("Motorista nao encontrado"));

        driver.setActive(!driver.isActive());
        return toResponse(userRepository.save(driver));
    }

    public UserResponse updateDriver(Long driverId, UpdateUserRequest request, User admin) {
        User driver = userRepository.findById(driverId)
                .filter(user -> user.getRole() == Role.DRIVER)
                .filter(user -> user.getCompany().getId().equals(admin.getCompany().getId()))
                .orElseThrow(() -> new RuntimeException("Motorista nao encontrado"));

        if (userRepository.existsByEmailAndIdNot(request.email(), driverId)) {
            throw new RuntimeException("Email ja cadastrado");
        }

        driver.setName(request.name());
        driver.setEmail(request.email());

        return toResponse(userRepository.save(driver));
    }

    public void deleteDriver(Long driverId, User admin) {
        User driver = userRepository.findById(driverId)
                .filter(user -> user.getRole() == Role.DRIVER)
                .filter(user -> user.getCompany().getId().equals(admin.getCompany().getId()))
                .orElseThrow(() -> new RuntimeException("Motorista nao encontrado"));

        List<Trip> trips = tripRepository.findAllByDriverId(driverId);
        trips.forEach(trip -> trip.setDriver(null));
        tripRepository.saveAll(trips);

        userRepository.delete(driver);
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.isActive()
        );
    }
}
