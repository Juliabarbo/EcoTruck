package com.ecotruck.config;

import com.ecotruck.model.Company;
import com.ecotruck.model.User;
import com.ecotruck.model.enums.Plan;
import com.ecotruck.model.enums.Role;
import com.ecotruck.repository.CompanyRepository;
import com.ecotruck.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            UserRepository userRepository,
            CompanyRepository companyRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.existsByEmail("admin@ecotruck.com")) {
            return;
        }

        Company company = new Company();
        company.setName("Transportadora Teste Ltda");
        company.setCnpj("00.000.000/0001-00");
        company.setPlan(Plan.PROFESSIONAL);
        company.setCep("01310-100");
        company.setLogradouro("Avenida Paulista");
        company.setNumero("1000");
        company.setBairro("Bela Vista");
        company.setCidade("São Paulo");
        company.setEstado("SP");
        company = companyRepository.save(company);

        userRepository.save(createUser("Administrador", "admin@ecotruck.com", Role.ADMIN, company));
        userRepository.save(createUser("Motorista 1", "motorista1@ecotruck.com", Role.DRIVER, company));
        userRepository.save(createUser("Motorista 2", "motorista2@ecotruck.com", Role.DRIVER, company));
    }

    private User createUser(String name, String email, Role role, Company company) {
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode("123456"));
        user.setRole(role);
        user.setCompany(company);
        return user;
    }
}
