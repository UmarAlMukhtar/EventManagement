package com.eventmanagement.api;

import com.eventmanagement.service.UserService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserService users;
    public AuthController(UserService users) { this.users = users; }

    @PostMapping("/login")
    public Map<String, String> login(@Valid @RequestBody Requests.Login body) { return Map.of("token", users.login(body)); }

    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, String> signup(@Valid @RequestBody Requests.Signup body) {
        return Map.of("message", "User created successfully", "user_id", users.signup(body));
    }
}
