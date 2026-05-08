package com.ecotruck.controller;

import com.ecotruck.dto.request.CreateDriverRequest;
import com.ecotruck.dto.request.UpdateUserRequest;
import com.ecotruck.dto.response.UserResponse;
import com.ecotruck.model.User;
import com.ecotruck.service.UserService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/")
    public ResponseEntity<List<UserResponse>> getAllDrivers(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(userService.getAllDrivers(user));
    }

    @PostMapping("/")
    public ResponseEntity<UserResponse> createDriver(
            @RequestBody CreateDriverRequest request,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createDriver(request, user));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<UserResponse> toggleDriverActive(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(userService.toggleDriverActive(id, user));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<UserResponse> updateDriver(
            @PathVariable Long id,
            @RequestBody UpdateUserRequest request,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(userService.updateDriver(id, request, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDriver(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        userService.deleteDriver(id, user);
        return ResponseEntity.noContent().build();
    }
}
