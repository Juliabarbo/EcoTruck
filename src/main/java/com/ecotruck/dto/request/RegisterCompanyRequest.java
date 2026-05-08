package com.ecotruck.dto.request;

import com.ecotruck.model.enums.Plan;

public record RegisterCompanyRequest(
        String companyName,
        String cnpj,
        String adminName,
        String email,
        String password,
        Plan plan,
        String cep,
        String numero,
        String complemento
) {
}
