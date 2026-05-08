package com.ecotruck.service;

import com.ecotruck.dto.request.LoginRequest;
import com.ecotruck.dto.request.RegisterCompanyRequest;
import com.ecotruck.dto.response.AuthResponse;
import com.ecotruck.dto.response.ViaCepResponse;
import com.ecotruck.model.Company;
import com.ecotruck.model.User;
import com.ecotruck.model.enums.Role;
import com.ecotruck.repository.CompanyRepository;
import com.ecotruck.repository.UserRepository;
import com.ecotruck.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final CompanyRepository companyRepository;
    private final ViaCepService viaCepService;

    public AuthService(
            UserRepository userRepository,
            JwtService jwtService,
            PasswordEncoder passwordEncoder,
            CompanyRepository companyRepository,
            ViaCepService viaCepService
    ) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.companyRepository = companyRepository;
        this.viaCepService = viaCepService;
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("Credenciais inválidas"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new RuntimeException("Credenciais inválidas");
        }

        if (!user.isActive()) {
            throw new RuntimeException("Sua conta esta desativada. Entre em contato com o administrador.");
        }

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, user.getName(), user.getEmail(), user.getRole());
    }

    public AuthResponse registerCompany(RegisterCompanyRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new RuntimeException("Email ja cadastrado");
        }

        ViaCepResponse endereco = viaCepService.buscarEndereco(request.cep());

        Company company = new Company();
        company.setName(request.companyName());
        company.setCnpj(request.cnpj());
        company.setPlan(request.plan());
        company.setCep(endereco.cep());
        company.setLogradouro(endereco.logradouro());
        company.setNumero(request.numero());
        company.setComplemento(request.complemento());
        company.setBairro(endereco.bairro());
        company.setCidade(endereco.localidade());
        company.setEstado(endereco.uf());
        company = companyRepository.save(company);

        User admin = new User();
        admin.setName(request.adminName());
        admin.setEmail(request.email());
        admin.setPassword(passwordEncoder.encode(request.password()));
        admin.setRole(Role.ADMIN);
        admin.setCompany(company);
        admin = userRepository.save(admin);

        String token = jwtService.generateToken(admin);
        return new AuthResponse(token, admin.getName(), admin.getEmail(), admin.getRole());
    }
}
