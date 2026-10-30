package com.eventmanagement;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.eventmanagement.api.Requests;
import com.eventmanagement.auth.AuthUser;
import com.eventmanagement.service.UserService;
import com.fasterxml.jackson.databind.*;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.*;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.*;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ApiIntegrationTest {
    private static final String SECRET = "integration-test-secret-for-legacy-jwt-compatibility";
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired JdbcTemplate db;
    @Autowired BCryptPasswordEncoder passwords;
    @Autowired UserService users;

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry properties) {
        String url = System.getenv("TEST_DB_URL");
        boolean maria = url != null && !url.isBlank();
        properties.add("spring.datasource.url", () -> maria ? url : "jdbc:h2:mem:eventmanagement;MODE=MySQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1");
        properties.add("spring.datasource.username", () -> System.getenv().getOrDefault("TEST_DB_USER", maria ? "root" : "sa"));
        properties.add("spring.datasource.password", () -> System.getenv().getOrDefault("TEST_DB_PASSWORD", ""));
        properties.add("spring.sql.init.schema-locations", () -> "file:db.sql,classpath:" + (maria ? "id-sequences.sql" : "test-sequences.sql"));
        properties.add("app.jwt-secret", () -> SECRET);
    }

    @BeforeEach
    void reset() {
        for (String table : List.of("feedback", "attendance", "registrations", "events", "users")) db.update("DELETE FROM " + table);
        db.update("UPDATE id_sequences SET next_value = 1");
        db.update("INSERT INTO users (user_id, name, email, password, role) VALUES ('admin', 'Admin', 'admin@example.com', ?, 'admin')", passwords.encode("admin-password"));
    }

    @Test
    void authenticationAndExistingBcryptAndJwtRemainCompatible() throws Exception {
        String id = signup("participant");
        mvc.perform(post("/api/auth/signup").contentType("application/json")
                .content(json.writeValueAsString(Map.of("name", "Duplicate", "email", "participant@example.com", "password", "password"))))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.error").value("User already exists"));
        JsonNode token = call(post("/api/auth/login"), Map.of("username", id, "password", "password"), null, 200);
        assertThat(JWT.decode(token.get("token").asText()).getClaim("user_id").asString()).isEqualTo(id);
        call(post("/api/auth/login"), Map.of("email", "participant@example.com", "password", "wrong"), null, 401);
        call(post("/api/auth/login"), Map.of("password", "password"), null, 400);
        // Node bcrypt writes $2b$ hashes. Retain the hash, changing only its version prefix.
        String hash = passwords.encode("legacy-password").replace("$2a$", "$2b$");
        db.update("UPDATE users SET password = ? WHERE user_id = ?", hash, id);
        call(post("/api/auth/login"), Map.of("username", id, "password", "legacy-password"), null, 200);
        // Build HS256 using raw HMAC instead of the Java JWT library (jsonwebtoken wire format).
        String legacy = legacyToken(id, "participant");
        JsonNode profile = call(get("/api/users/profile"), null, legacy, 200);
        assertThat(profile.get("user_id").asText()).isEqualTo(id);
        assertThat(profile.has("password")).isFalse();
    }

    @Test
    void eventRegistrationAttendanceFeedbackAndCascades() throws Exception {
        String coordinator = signup("coordinator");
        String participant = signup("participant");
        String ownerToken = login(coordinator), participantToken = login(participant), adminToken = login("admin", "admin-password");
        call(post("/api/events"), eventBody(), ownerToken, 201);
        JsonNode all = call(get("/api/events"), null, null, 200);
        String event = all.get(0).get("event_id").asText();
        assertThat(event).isEqualTo("e001");
        assertThat(all.get(0).get("date").asText()).startsWith("2027-01-20T10:30");
        call(get("/api/events/" + event), null, null, 200);
        assertThat(call(get("/api/events/coordinator/" + coordinator), null, null, 200).size()).isEqualTo(1);
        call(put("/api/events/" + event), eventBody(), ownerToken, 200);
        JsonNode before = call(get("/api/registrations/check/" + event), null, participantToken, 200);
        assertThat(before.get("isRegistered").asBoolean()).isFalse();
        assertThat(before.get("registration").isNull()).isTrue();
        String reg = call(post("/api/registrations"), Map.of("event_id", event), participantToken, 201).get("registration_id").asText();
        assertThat(reg).isEqualTo("r001");
        call(post("/api/registrations"), Map.of("event_id", event), participantToken, 409);
        assertThat(call(get("/api/registrations/check/" + event), null, participantToken, 200).get("isRegistered").asBoolean()).isTrue();
        assertThat(call(get("/api/registrations/my-registrations"), null, participantToken, 200).get(0).get("event_title").asText()).isEqualTo("Workshop");
        assertThat(call(get("/api/registrations/user/" + participant), null, adminToken, 200).size()).isEqualTo(1);
        assertThat(call(get("/api/registrations/event/" + event), null, ownerToken, 200).get(0).get("user_name").asText()).isEqualTo("participant");
        call(post("/api/attendance"), Map.of("reg_id", reg, "status", "present"), ownerToken, 201);
        call(post("/api/attendance"), Map.of("reg_id", reg, "status", "absent"), ownerToken, 201);
        JsonNode attendance = call(get("/api/attendance/registration/" + reg), null, ownerToken, 200);
        assertThat(attendance.size()).isEqualTo(1);
        assertThat(attendance.get(0).get("status").asText()).isEqualTo("absent");
        String att = attendance.get(0).get("att_id").asText();
        call(put("/api/attendance/" + att), Map.of("status", "late"), ownerToken, 200);
        assertThat(call(get("/api/attendance/user/" + participant), null, participantToken, 200).get(0).get("status").asText()).isEqualTo("late");
        // Current frontend payload, followed by the original API payload.
        call(post("/api/feedback"), Map.of("event_id", event, "feedback", "Great workshop"), participantToken, 201);
        call(post("/api/feedback"), Map.of("reg_id", reg, "rating", 5, "comment", "Useful"), participantToken, 201);
        assertThat(call(get("/api/feedback/event/" + event), null, null, 200).size()).isEqualTo(2);
        assertThat(call(get("/api/feedback/registration/" + reg), null, null, 200).size()).isEqualTo(2);
        assertThat(call(get("/api/feedback/user/" + participant), null, null, 200).size()).isEqualTo(2);
        call(put("/api/registrations/" + reg), Map.of("status", "cancelled"), adminToken, 200);
        call(post("/api/feedback"), Map.of("reg_id", reg, "rating", 5), participantToken, 400);
        call(delete("/api/events/" + event), null, ownerToken, 200);
        for (String table : List.of("registrations", "attendance", "feedback")) {
            assertThat(db.queryForObject("SELECT COUNT(*) FROM " + table, Integer.class)).isZero();
        }
        call(get("/api/events/" + event), null, null, 404);
    }

    @Test
    void roleAndOwnershipChecksProtectWrites() throws Exception {
        String owner = signup("coordinator"), other = signup("other", "coordinator"), participant = signup("participant");
        String ownerToken = login(owner), otherToken = login(other), token = login(participant);
        call(post("/api/events"), eventBody(), null, 401);
        call(post("/api/events"), eventBody(), "invalid", 403);
        call(post("/api/events"), eventBody(), token, 403);
        call(post("/api/events"), eventBody(), ownerToken, 201);
        call(put("/api/events/e001"), eventBody(), otherToken, 403);
        call(delete("/api/events/e001"), null, otherToken, 403);
        call(post("/api/registrations"), Map.of("event_id", "e001"), token, 201);
        call(get("/api/registrations/event/e001"), null, otherToken, 403);
        call(get("/api/registrations/user/" + participant), null, token, 403);
        call(post("/api/attendance"), Map.of("reg_id", "r001", "status", "present"), token, 403);
        call(post("/api/attendance"), Map.of("reg_id", "r001", "status", "present"), otherToken, 403);
        call(post("/api/feedback"), Map.of("reg_id", "r001", "rating", 4), otherToken, 403);
        call(post("/api/feedback"), Map.of("reg_id", "r001", "rating", 4), null, 401);
        call(put("/api/users/" + owner), Map.of("name", "Intruder"), token, 403);
        call(put("/api/users/" + participant), Map.of("role", "admin"), token, 403);
        call(delete("/api/users/" + owner), null, token, 403);
        String noAdmin = signup("wouldbeadmin", "admin");
        assertThat(call(get("/api/users/" + noAdmin), null, null, 200).get("role").asText()).isEqualTo("participant");
    }

    @Test
    void profileUpdatesRetainHashAndPublicResponsesNeverExposeIt() throws Exception {
        String id = signup("participant"), token = login(id);
        String hash = db.queryForObject("SELECT password FROM users WHERE user_id = ?", String.class, id);
        call(put("/api/users/" + id), Map.of("name", "New name"), token, 200);
        assertThat(db.queryForObject("SELECT password FROM users WHERE user_id = ?", String.class, id)).isEqualTo(hash);
        call(put("/api/users/" + id), Map.of("password", "new-password"), token, 200);
        call(post("/api/auth/login"), Map.of("username", id, "password", "new-password"), null, 200);
        JsonNode all = call(get("/api/users"), null, null, 200);
        all.forEach(user -> assertThat(user.has("password")).isFalse());
        assertThat(call(get("/api/users/" + id), null, null, 200).has("password")).isFalse();
        call(delete("/api/users/" + id), null, token, 200);
        call(get("/api/users/profile"), null, token, 403);
    }

    @Test
    void validationErrorsAndCorsUseTheExpectedContract() throws Exception {
        call(post("/api/auth/signup"), Map.of("name", "", "email", "not-email", "password", "x"), null, 400);
        call(post("/api/auth/signup"), Map.of("name", "User", "email", "user@example.com", "password", "x".repeat(73)), null, 400);
        String id = signup("coordinator"), token = login(id);
        call(post("/api/events"), Map.of("title", "Test", "date", "invalid", "venue", "Lab"), token, 400);
        call(post("/api/events"), Map.of("title", "Test", "venue", "Lab"), token, 400);
        call(post("/api/registrations"), Map.of("event_id", "missing"), token, 404);
        call(get("/api/users/missing"), null, null, 404);
        call(get("/api/unknown"), null, null, 404);
        call(post("/api/feedback"), Map.of("rating", 8), token, 400);
        mvc.perform(post("/api/auth/login").contentType("application/json").content("{"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.error").exists());
        mvc.perform(options("/api/events").header("Origin", "http://localhost:5173")
                .header("Access-Control-Request-Method", "POST").header("Access-Control-Request-Headers", "authorization,content-type"))
                .andExpect(status().isOk()).andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"));
        mvc.perform(options("/api/events").header("Origin", "https://untrusted.example")
                .header("Access-Control-Request-Method", "POST")).andExpect(status().isForbidden());
        mvc.perform(get("/api/status")).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("API is running"));
        mvc.perform(get("/api")).andExpect(status().isOk()).andExpect(content().contentTypeCompatibleWith("application/json"))
                .andExpect(content().json("\"Welcome to the Event Management System API\""));
    }

    @Test
    void expiredWrongAlgorithmAndStaleRoleTokensAreRejected() throws Exception {
        String id = signup("coordinator"), token = login(id);
        String expired = JWT.create().withClaim("user_id", id).withClaim("role", "coordinator")
                .withExpiresAt(Instant.now().minusSeconds(60)).sign(Algorithm.HMAC256(SECRET));
        call(get("/api/users/profile"), null, expired, 403);
        String wrongAlgorithm = JWT.create().withClaim("user_id", id).withClaim("role", "coordinator")
                .withExpiresAt(Instant.now().plusSeconds(600)).sign(Algorithm.HMAC512(SECRET));
        call(get("/api/users/profile"), null, wrongAlgorithm, 403);
        db.update("UPDATE users SET role = 'participant' WHERE user_id = ?", id);
        call(post("/api/events"), eventBody(), token, 403);
    }

    @Test
    void registrationDeleteCascadesAndLegacyUserCreationHashesPasswords() throws Exception {
        JsonNode created = call(post("/api/users"), Map.of("name", "Legacy", "email", "legacy@example.com", "password", "password", "role", "admin"), null, 201);
        String id = created.get("user_id").asText();
        assertThat(db.queryForObject("SELECT password FROM users WHERE user_id = ?", String.class, id)).startsWith("$2");
        assertThat(users.user(id).get("role")).isEqualTo("participant");
        String owner = signup("coordinator"), ownerToken = login(owner), token = login(id);
        call(post("/api/events"), eventBody(), ownerToken, 201);
        call(post("/api/registrations"), Map.of("event_id", "e001"), token, 201);
        call(post("/api/attendance"), Map.of("reg_id", "r001", "status", "present"), ownerToken, 201);
        call(post("/api/feedback"), Map.of("reg_id", "r001", "rating", 5), token, 201);
        call(delete("/api/registrations/r001"), null, login("admin", "admin-password"), 200);
        assertThat(db.queryForObject("SELECT COUNT(*) FROM attendance", Integer.class)).isZero();
        assertThat(db.queryForObject("SELECT COUNT(*) FROM feedback", Integer.class)).isZero();
    }

    @Test
    void simultaneousSignupsHaveDistinctSequentialIds() throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(6);
        try {
            List<Callable<String>> tasks = new ArrayList<>();
            for (int i = 0; i < 12; i++) {
                int number = i;
                tasks.add(() -> users.signup(new Requests.Signup("User", "concurrent" + number + "@example.com", "password", "participant")));
            }
            Set<String> ids = new HashSet<>();
            for (Future<String> result : pool.invokeAll(tasks)) ids.add(result.get(30, TimeUnit.SECONDS));
            assertThat(ids).hasSize(12).contains("u001", "u012");
        } finally { pool.shutdownNow(); }
    }

    @Test
    void failedWriteRollsBackItsIdAllocation() {
        db.update("INSERT INTO users (user_id, name, email, password, role) VALUES ('u001', 'Existing', 'existing@example.com', 'unused', 'participant')");
        assertThatThrownBy(() -> users.signup(new Requests.Signup("New", "new@example.com", "password", "participant")))
                .isInstanceOf(org.springframework.dao.DataIntegrityViolationException.class);
        assertThat(db.queryForObject("SELECT next_value FROM id_sequences WHERE entity = 'users'", Long.class)).isEqualTo(1);
    }

    private String signup(String role) throws Exception { return signup(role, role); }
    private String signup(String name, String role) throws Exception {
        return call(post("/api/auth/signup"), Map.of("name", name, "email", name + "@example.com", "password", "password", "role", role), null, 201).get("user_id").asText();
    }
    private String login(String id) throws Exception { return login(id, "password"); }
    private String login(String id, String password) throws Exception {
        return call(post("/api/auth/login"), Map.of("username", id, "password", password), null, 200).get("token").asText();
    }
    private Map<String, Object> eventBody() {
        return Map.of("title", "Workshop", "description", "Hands-on session", "date", "2027-01-20T10:30:00", "venue", "Lab");
    }
    private JsonNode call(MockHttpServletRequestBuilder request, Object body, String token, int expected) throws Exception {
        if (body != null) request.contentType("application/json").content(json.writeValueAsString(body));
        if (token != null) request.header("Authorization", "Bearer " + token);
        MvcResult result = mvc.perform(request).andExpect(status().is(expected)).andReturn();
        JsonNode node = json.readTree(result.getResponse().getContentAsString());
        if (expected >= 400) assertThat(node.has("error")).isTrue();
        return node;
    }
    private String legacyToken(String id, String role) throws Exception {
        var encoder = Base64.getUrlEncoder().withoutPadding();
        String header = encoder.encodeToString("{\"alg\":\"HS256\",\"typ\":\"JWT\"}".getBytes(StandardCharsets.UTF_8));
        String payload = encoder.encodeToString(json.writeValueAsBytes(Map.of("user_id", id, "role", role, "iat", Instant.now().getEpochSecond(), "exp", Instant.now().plusSeconds(3600).getEpochSecond())));
        String content = header + "." + payload;
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        return content + "." + encoder.encodeToString(mac.doFinal(content.getBytes(StandardCharsets.UTF_8)));
    }
}
