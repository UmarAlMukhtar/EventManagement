package com.eventmanagement.service;

import com.eventmanagement.api.*;
import com.eventmanagement.auth.AuthUser;
import com.eventmanagement.data.Store;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EventService {
    private final Store db;
    public EventService(Store db) { this.db = db; }

    public List<Map<String, Object>> events() { return db.rows("SELECT * FROM events"); }

    public List<Map<String, Object>> event(String id) {
        // The Express endpoint returned an array; retain that successful response shape.
        return List.of(db.one("SELECT * FROM events WHERE event_id = ?", "Event not found.", id));
    }

    public List<Map<String, Object>> byCoordinator(String id) {
        return db.rows("SELECT * FROM events WHERE coordinator_id = ?", id);
    }

    @Transactional
    public void create(Requests.Event body, AuthUser actor) {
        String id = db.nextId("events", "e");
        db.update("INSERT INTO events (event_id, title, description, date, venue, coordinator_id) VALUES (?, ?, ?, ?, ?, ?)",
                id, body.title(), body.description(), body.date(), body.venue(), actor.userId());
    }

    @Transactional
    public void update(String id, Requests.Event body, AuthUser actor) {
        var existing = requireManager(id, actor);
        String coordinator = body.coordinator_id() == null ? (String) existing.get("coordinator_id") : body.coordinator_id();
        if (!coordinator.equals(existing.get("coordinator_id")) && !actor.isAdmin()) {
            throw new ApiException(403, "Only admins can transfer an event");
        }
        var target = db.one("SELECT role FROM users WHERE user_id = ?", "Coordinator not found.", coordinator);
        if (!Set.of("admin", "coordinator").contains(target.get("role"))) throw new ApiException(400, "Invalid coordinator");
        db.update("UPDATE events SET title=?, description=?, date=?, venue=?, coordinator_id=? WHERE event_id=?",
                body.title(), body.description(), body.date(), body.venue(), coordinator, id);
    }

    @Transactional
    public void delete(String id, AuthUser actor) {
        requireManager(id, actor);
        db.update("DELETE FROM events WHERE event_id = ?", id);
    }

    public Map<String, Object> requireManager(String id, AuthUser actor) {
        var event = db.one("SELECT * FROM events WHERE event_id = ?", "Event not found.", id);
        if (!actor.isAdmin() && !actor.userId().equals(event.get("coordinator_id"))) {
            throw new ApiException(403, "You can only manage your own events");
        }
        return event;
    }
}
