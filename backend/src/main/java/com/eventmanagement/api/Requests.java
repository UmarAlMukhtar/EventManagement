package com.eventmanagement.api;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

public final class Requests {
    private Requests() {}

    public record Login(@Email @Size(max=100) String email, @Size(max=10) String username,
                        @NotBlank String password) {}
    public record Signup(@NotBlank @Size(max=100) String name, @NotBlank @Email @Size(max=100) String email,
                         @NotBlank String password, String role) {}
    public record UserUpdate(@Size(min=1, max=100) String name, @Email @Size(min=1, max=100) String email,
                             @Size(min=1) String password, String role) {}
    public record Event(@NotBlank @Size(max=200) String title, String description,
                        @NotNull LocalDateTime date, @NotBlank @Size(max=255) String venue,
                        @Size(max=10) String coordinator_id) {}
    public record Registration(@NotBlank @Size(max=10) String event_id) {}
    public record RegistrationStatus(@NotBlank @Pattern(regexp="pending|confirmed|cancelled") String status) {}
    public record Attendance(@NotBlank @Size(max=10) String reg_id,
                             @NotBlank @Pattern(regexp="present|absent|late") String status) {}
    public record AttendanceStatus(@NotBlank @Pattern(regexp="present|absent|late") String status) {}
    public record Feedback(@Size(max=10) String reg_id, @Size(max=10) String event_id,
                           @Min(1) @Max(5) Integer rating, String comment, String feedback) {}
}
