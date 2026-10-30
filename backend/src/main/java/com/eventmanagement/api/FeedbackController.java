package com.eventmanagement.api;

import com.eventmanagement.auth.*;
import com.eventmanagement.service.ParticipationService;
import jakarta.validation.Valid;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {
    private final ParticipationService participation;
    public FeedbackController(ParticipationService participation) { this.participation = participation; }

    @PostMapping @Access @ResponseStatus(HttpStatus.CREATED)
    public Map<String, String> submit(@Valid @RequestBody Requests.Feedback body, @RequestAttribute("authUser") AuthUser user) {
        participation.feedback(body, user);
        return Map.of("message", "Feedback submitted.");
    }

    @GetMapping("/registration/{id}")
    public List<Map<String, Object>> byReg(@PathVariable String id) { return participation.feedbackByReg(id); }

    @GetMapping("/event/{id}")
    public List<Map<String, Object>> byEvent(@PathVariable String id) { return participation.feedbackByEvent(id); }

    @GetMapping("/user/{id}")
    public List<Map<String, Object>> byUser(@PathVariable String id) { return participation.feedbackByUser(id); }
}
