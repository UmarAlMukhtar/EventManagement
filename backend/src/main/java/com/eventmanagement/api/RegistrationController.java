package com.eventmanagement.api;

import com.eventmanagement.auth.*;
import com.eventmanagement.service.ParticipationService;
import jakarta.validation.Valid;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/registrations")
@Access
public class RegistrationController {
    private final ParticipationService participation;
    public RegistrationController(ParticipationService participation) { this.participation = participation; }

    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public Map<String, String> register(@Valid @RequestBody Requests.Registration body, @RequestAttribute("authUser") AuthUser user) {
        return Map.of("message", "Registration successful", "registration_id", participation.register(body.event_id(), user));
    }

    @GetMapping("/my-registrations")
    public List<Map<String, Object>> mine(@RequestAttribute("authUser") AuthUser user) { return participation.byUser(user.userId()); }

    @GetMapping("/check/{id}")
    public Map<String, Object> check(@PathVariable String id, @RequestAttribute("authUser") AuthUser user) {
        return participation.registrationStatus(id, user);
    }

    @GetMapping("/user/{id}") @Access("admin")
    public List<Map<String, Object>> byUser(@PathVariable String id) { return participation.byUser(id); }

    @GetMapping("/event/{id}") @Access({"admin", "coordinator"})
    public List<Map<String, Object>> byEvent(@PathVariable String id, @RequestAttribute("authUser") AuthUser user) {
        return participation.byEvent(id, user);
    }

    @PutMapping("/{id}") @Access("admin")
    public Map<String, String> update(@PathVariable String id, @Valid @RequestBody Requests.RegistrationStatus body) {
        participation.updateRegistration(id, body.status());
        return Map.of("message", "Registration updated.");
    }

    @DeleteMapping("/{id}") @Access("admin")
    public Map<String, String> delete(@PathVariable String id) {
        participation.deleteRegistration(id);
        return Map.of("message", "Registration deleted.");
    }
}
