package com.eventmanagement.api;

import com.eventmanagement.auth.*;
import com.eventmanagement.service.EventService;
import jakarta.validation.Valid;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events")
public class EventController {
    private final EventService events;
    public EventController(EventService events) { this.events = events; }

    @GetMapping
    public List<Map<String, Object>> all() { return events.events(); }

    @GetMapping("/{id}")
    public List<Map<String, Object>> one(@PathVariable String id) { return events.event(id); }

    @GetMapping("/coordinator/{id}")
    public List<Map<String, Object>> byCoordinator(@PathVariable String id) { return events.byCoordinator(id); }

    @PostMapping @Access({"admin", "coordinator"}) @ResponseStatus(HttpStatus.CREATED)
    public Map<String, String> create(@Valid @RequestBody Requests.Event body, @RequestAttribute("authUser") AuthUser user) {
        events.create(body, user);
        return Map.of("message", "Event created.");
    }

    @PutMapping("/{id}") @Access({"admin", "coordinator"})
    public Map<String, String> update(@PathVariable String id, @Valid @RequestBody Requests.Event body,
                                     @RequestAttribute("authUser") AuthUser user) {
        events.update(id, body, user);
        return Map.of("message", "Event updated.");
    }

    @DeleteMapping("/{id}") @Access({"admin", "coordinator"})
    public Map<String, String> delete(@PathVariable String id, @RequestAttribute("authUser") AuthUser user) {
        events.delete(id, user);
        return Map.of("message", "Event deleted.");
    }
}
