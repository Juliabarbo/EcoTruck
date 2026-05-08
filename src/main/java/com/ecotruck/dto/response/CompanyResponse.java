package com.ecotruck.dto.response;

import com.ecotruck.model.enums.Plan;

public record CompanyResponse(
        Long id,
        String name,
        String cnpj,
        Plan plan,
        String logradouro,
        String numero,
        String complemento,
        String bairro,
        String cidade,
        String estado
) {
}
