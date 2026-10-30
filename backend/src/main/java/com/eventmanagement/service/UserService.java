package com.eventmanagement.service;

import com.eventmanagement.api.*;
import com.eventmanagement.auth.*;
import com.eventmanagement.data.Store;
import java.nio.charset.StandardCharsets;
import java.util.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {
    private static final String PUBLIC_FIELDS = "user_id, name, email, role, created_at, updated_at";
    private final Store db;
    private final BCryptPasswordEncoder passwords;
    private final TokenService tokens;

    public UserService(Store db, BCryptPasswordEncoder passwords, TokenService tokens) {
        this.db = db; this.passwords = passwords; this.tokens = tokens;
    }

    public String login(Requests.Login body) {
        if ((body.email() == null || body.email().isBlank()) && (body.username() == null || body.username().isBlank())) {
            throw new ApiException(400, "Email or username is required");
        }
        var users = db.rows("SELECT * FROM users WHERE email = ? OR user_id = ?", body.email(), body.username());
        if (users.isEmpty()) throw new ApiException(401, "Invalid credentials");
        var user = users.get(0);
        if (!passwords.matches(body.password(), (String) user.get("password"))) throw new ApiException(401, "Invalid password");
        return tokens.issue((String) user.get("user_id"), (String) user.get("role"));
    }

    @Transactional
    public String signup(Requests.Signup body) {
        if (!db.rows("SELECT user_id FROM users WHERE email = ?", body.email()).isEmpty()) {
            throw new ApiException(409, "User already exists");
        }
        String role = "coordinator".equals(body.role()) ? "coordinator" : "participant";
        String hash = hash(body.password());
        String id = db.nextId("users", "u");
        db.update("INSERT INTO users (user_id, name, email, password, role) VALUES (?, ?, ?, ?, ?)",
                id, body.name(), body.email(), hash, role);
        return id;
    }

    public List<Map<String, Object>> users() { return db.rows("SELECT " + PUBLIC_FIELDS + " FROM users"); }

    public Map<String, Object> user(String id) {
        return db.one("SELECT " + PUBLIC_FIELDS + " FROM users WHERE user_id = ?", "User not found.", id);
    }

    @Transactional
    public void update(String id, Requests.UserUpdate body, AuthUser actor) {
        requireOwner(id, actor);
        var existing = db.one("SELECT * FROM users WHERE user_id = ?", "User not found.", id);
        String role = body.role() == null ? (String) existing.get("role") : body.role();
        if (!Set.of("participant", "coordinator", "admin").contains(role)) throw new ApiException(400, "Invalid role");
        if (!actor.isAdmin() && !role.equals(existing.get("role"))) throw new ApiException(403, "Only admins can change roles");
        db.update("UPDATE users SET name=?, email=?, password=?, role=? WHERE user_id=?",
                body.name() == null ? existing.get("name") : body.name(),
                body.email() == null ? existing.get("email") : body.email(),
                body.password() == null ? existing.get("password") : hash(body.password()), role, id);
    }

    @Transactional
    public void delete(String id, AuthUser actor) {
        requireOwner(id, actor);
        user(id);
        db.update("DELETE FROM users WHERE user_id = ?", id);
    }

    private void requireOwner(String id, AuthUser actor) {
        if (!actor.isAdmin() && !actor.userId().equals(id)) throw new ApiException(403, "You can only manage your own account");
    }

    private String hash(String password) {
        if (password.getBytes(StandardCharsets.UTF_8).length > 72) throw new ApiException(400, "Password must be at most 72 UTF-8 bytes");
        return passwords.encode(password);
    }
}
