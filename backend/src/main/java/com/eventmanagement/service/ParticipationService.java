package com.eventmanagement.service;

import com.eventmanagement.api.*;
import com.eventmanagement.auth.AuthUser;
import com.eventmanagement.data.Store;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ParticipationService {
    private final Store db;
    private final EventService events;
    public ParticipationService(Store db, EventService events) { this.db = db; this.events = events; }

    @Transactional
    public String register(String eventId, AuthUser actor) {
        db.one("SELECT event_id FROM events WHERE event_id = ?", "Event not found.", eventId);
        if (registration(eventId, actor.userId()) != null) throw new ApiException(409, "Already registered for this event");
        String id = db.nextId("registrations", "r");
        db.update("INSERT INTO registrations (reg_id, event_id, user_id, reg_date, status) VALUES (?, ?, ?, ?, 'confirmed')",
                id, eventId, actor.userId(), LocalDate.now(ZoneOffset.UTC));
        return id;
    }

    public Map<String, Object> registration(String eventId, String userId) {
        var rows = db.rows("SELECT * FROM registrations WHERE event_id = ? AND user_id = ?", eventId, userId);
        return rows.isEmpty() ? null : rows.get(0);
    }

    public Map<String, Object> registrationStatus(String eventId, AuthUser actor) {
        var row = registration(eventId, actor.userId());
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("isRegistered", row != null);
        result.put("registration", row);
        return result;
    }

    public List<Map<String, Object>> byUser(String userId) {
        return db.rows("""
                SELECT r.*, e.title, e.date, e.venue, e.title AS event_title,
                       e.date AS event_date, e.venue AS event_venue
                FROM registrations r JOIN events e ON r.event_id = e.event_id WHERE r.user_id = ?
                """, userId);
    }

    public List<Map<String, Object>> byEvent(String eventId, AuthUser actor) {
        events.requireManager(eventId, actor);
        return db.rows("""
                SELECT r.*, u.name, u.email, u.name AS user_name, u.email AS user_email
                FROM registrations r JOIN users u ON r.user_id = u.user_id WHERE r.event_id = ?
                """, eventId);
    }

    @Transactional
    public void updateRegistration(String id, String status) {
        db.one("SELECT reg_id FROM registrations WHERE reg_id = ?", "Registration not found.", id);
        db.update("UPDATE registrations SET status = ? WHERE reg_id = ?", status, id);
    }

    @Transactional
    public void deleteRegistration(String id) {
        db.one("SELECT reg_id FROM registrations WHERE reg_id = ?", "Registration not found.", id);
        db.update("DELETE FROM registrations WHERE reg_id = ?", id);
    }

    @Transactional
    public void markAttendance(Requests.Attendance body, AuthUser actor) {
        // Lock the parent registration to serialize concurrent upserts for this attendee.
        var registration = db.one("SELECT * FROM registrations WHERE reg_id = ? FOR UPDATE", "Registration not found.", body.reg_id());
        events.requireManager((String) registration.get("event_id"), actor);
        var existing = db.rows("SELECT att_id FROM attendance WHERE reg_id = ?", body.reg_id());
        if (existing.isEmpty()) {
            String id = db.nextId("attendance", "a");
            db.update("INSERT INTO attendance (att_id, reg_id, status) VALUES (?, ?, ?)", id, body.reg_id(), body.status());
        } else {
            db.update("UPDATE attendance SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE reg_id = ?", body.status(), body.reg_id());
        }
    }

    public List<Map<String, Object>> attendanceByReg(String id, AuthUser actor) {
        var reg = db.one("SELECT * FROM registrations WHERE reg_id = ?", "Registration not found.", id);
        if (!actor.userId().equals(reg.get("user_id"))) events.requireManager((String) reg.get("event_id"), actor);
        return db.rows("SELECT * FROM attendance WHERE reg_id = ?", id);
    }

    public List<Map<String, Object>> attendanceByUser(String id, AuthUser actor) {
        if (!actor.isAdmin() && !actor.userId().equals(id)) throw new ApiException(403, "You can only view your own attendance");
        return db.rows("""
                SELECT a.* FROM attendance a JOIN registrations r ON a.reg_id = r.reg_id WHERE r.user_id = ?
                """, id);
    }

    @Transactional
    public void updateAttendance(String id, String status, AuthUser actor) {
        var row = db.one("""
                SELECT r.event_id FROM attendance a JOIN registrations r ON a.reg_id = r.reg_id WHERE a.att_id = ?
                """, "Attendance not found.", id);
        events.requireManager((String) row.get("event_id"), actor);
        db.update("UPDATE attendance SET status = ? WHERE att_id = ?", status, id);
    }

    @Transactional
    public void feedback(Requests.Feedback body, AuthUser actor) {
        Map<String, Object> reg;
        if (body.reg_id() != null && !body.reg_id().isBlank()) {
            reg = db.one("SELECT * FROM registrations WHERE reg_id = ?", "Registration not found.", body.reg_id());
            if (body.event_id() != null && !body.event_id().equals(reg.get("event_id"))) throw new ApiException(400, "Registration does not match event");
        } else if (body.event_id() != null && !body.event_id().isBlank()) {
            reg = registration(body.event_id(), actor.userId());
            if (reg == null) throw new ApiException(400, "Register for this event before submitting feedback");
        } else {
            throw new ApiException(400, "Registration ID or event ID is required");
        }
        if (!actor.userId().equals(reg.get("user_id"))) throw new ApiException(403, "You can only submit your own feedback");
        if ("cancelled".equals(reg.get("status"))) throw new ApiException(400, "Registration is cancelled");
        String comment = body.comment() != null ? body.comment() : body.feedback();
        if (body.rating() == null && (comment == null || comment.isBlank())) throw new ApiException(400, "Rating or comment is required");
        String id = db.nextId("feedback", "f");
        db.update("INSERT INTO feedback (fb_id, reg_id, rating, comment) VALUES (?, ?, ?, ?)", id, reg.get("reg_id"), body.rating(), comment);
    }

    public List<Map<String, Object>> feedbackByReg(String id) { return db.rows("SELECT * FROM feedback WHERE reg_id = ?", id); }

    public List<Map<String, Object>> feedbackByEvent(String id) {
        return db.rows("SELECT f.* FROM feedback f JOIN registrations r ON f.reg_id = r.reg_id WHERE r.event_id = ?", id);
    }

    public List<Map<String, Object>> feedbackByUser(String id) {
        return db.rows("SELECT f.* FROM feedback f JOIN registrations r ON f.reg_id = r.reg_id WHERE r.user_id = ?", id);
    }
}
