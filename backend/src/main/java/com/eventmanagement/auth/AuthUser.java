package com.eventmanagement.auth;

public record AuthUser(String userId, String role) {
    public boolean isAdmin() { return "admin".equals(role); }
}
