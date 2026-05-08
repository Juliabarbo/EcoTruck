package com.ecotruck.controller;

import com.ecotruck.dto.response.ViaCepResponse;
import com.ecotruck.service.ViaCepService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cep")
public class ViaCepController {

    private final ViaCepService viaCepService;

    public ViaCepController(ViaCepService viaCepService) {
        this.viaCepService = viaCepService;
    }

    @GetMapping("/{cep}")
    public ResponseEntity<ViaCepResponse> buscarEndereco(@PathVariable String cep) {
        return ResponseEntity.ok(viaCepService.buscarEndereco(cep));
    }
}
