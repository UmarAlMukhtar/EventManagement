package com.eventmanagement.api;

import java.time.Instant;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

@RestController
public class SystemController {
    @GetMapping(value={"/", "/api"}, produces="application/json")
    public String welcome() { return "\"Welcome to the Event Management System API\""; }

    @GetMapping("/api/status")
    public Map<String, Object> status() { return Map.of("status", "API is running", "timestamp", Instant.now()); }
}
