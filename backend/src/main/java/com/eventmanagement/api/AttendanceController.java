package com.eventmanagement.api;

import com.eventmanagement.auth.*;
import com.eventmanagement.service.ParticipationService;
import jakarta.validation.Valid;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/attendance")
@Access
public class AttendanceController {
    private final ParticipationService participation;
    public AttendanceController(ParticipationService participation) { this.participation = participation; }

    @PostMapping @Access({"admin", "coordinator"}) @ResponseStatus(HttpStatus.CREATED)
    public Map<String, String> mark(@Valid @RequestBody Requests.Attendance body, @RequestAttribute("authUser") AuthUser user) {
        participation.markAttendance(body, user);
        return Map.of("message", "Attendance marked.");
    }

    @GetMapping("/registration/{id}")
    public List<Map<String, Object>> byReg(@PathVariable String id, @RequestAttribute("authUser") AuthUser user) {
        return participation.attendanceByReg(id, user);
    }

    @GetMapping("/user/{id}")
    public List<Map<String, Object>> byUser(@PathVariable String id, @RequestAttribute("authUser") AuthUser user) {
        return participation.attendanceByUser(id, user);
    }

    @PutMapping("/{id}") @Access({"admin", "coordinator"})
    public Map<String, String> update(@PathVariable String id, @Valid @RequestBody Requests.AttendanceStatus body,
                                     @RequestAttribute("authUser") AuthUser user) {
        participation.updateAttendance(id, body.status(), user);
        return Map.of("message", "Attendance updated.");
    }
}
