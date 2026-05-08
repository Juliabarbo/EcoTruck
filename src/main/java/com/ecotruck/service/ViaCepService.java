package com.ecotruck.service;

import com.ecotruck.dto.response.ViaCepResponse;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class ViaCepService {

    private final RestTemplate restTemplate;

    public ViaCepService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public ViaCepResponse buscarEndereco(String cep) {
        String sanitizedCep = cep.replaceAll("\\D", "");
        String url = "https://viacep.com.br/ws/{cep}/json/";

        Map<?, ?> response = restTemplate.getForObject(url, Map.class, sanitizedCep);

        if (response == null || response.containsKey("erro")) {
            throw new RuntimeException("CEP não encontrado");
        }

        return new ViaCepResponse(
                valueAsString(response.get("cep")),
                valueAsString(response.get("logradouro")),
                valueAsString(response.get("complemento")),
                valueAsString(response.get("bairro")),
                valueAsString(response.get("localidade")),
                valueAsString(response.get("uf"))
        );
    }

    private String valueAsString(Object value) {
        return value == null ? null : value.toString();
    }
}
