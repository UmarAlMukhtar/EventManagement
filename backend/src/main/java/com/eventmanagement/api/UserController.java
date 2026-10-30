package com.eventmanagement.api;

import com.eventmanagement.auth.*;
import com.eventmanagement.service.UserService;
import jakarta.validation.Valid;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService users;
    public UserController(UserService users) { this.users = users; }

    @GetMapping
    public List<Map<String, Object>> all() { return users.users(); }

    @GetMapping("/profile") @Access
    public Map<String, Object> profile(@RequestAttribute("authUser") AuthUser user) { return users.user(user.userId()); }

    @GetMapping("/{id}")
    public Map<String, Object> one(@PathVariable String id) { return users.user(id); }

    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public Map<String, String> create(@Valid @RequestBody Requests.Signup body) {
        return Map.of("message", "User created.", "user_id", users.signup(body));
    }

    @PutMapping("/{id}") @Access
    public Map<String, String> update(@PathVariable String id, @Valid @RequestBody Requests.UserUpdate body,
                                      @RequestAttribute("authUser") AuthUser user) {
        users.update(id, body, user);
        return Map.of("message", "User updated.");
    }

    @DeleteMapping("/{id}") @Access
    public Map<String, String> delete(@PathVariable String id, @RequestAttribute("authUser") AuthUser user) {
        users.delete(id, user);
        return Map.of("message", "User deleted successfully.");
    }
}
