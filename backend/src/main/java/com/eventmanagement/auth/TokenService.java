package com.eventmanagement.auth;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.eventmanagement.api.ApiException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Set;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class TokenService {
    private final Algorithm algorithm;
    private final JWTVerifier verifier;

    public TokenService(@Value("${app.jwt-secret}") String secret) {
        if (secret.isBlank()) throw new IllegalArgumentException("JWT_SECRET must not be blank");
        algorithm = Algorithm.HMAC256(secret);
        verifier = JWT.require(algorithm).withClaimPresence("exp").build();
    }

    public String issue(String userId, String role) {
        return JWT.create().withClaim("user_id", userId).withClaim("role", role)
                .withIssuedAt(Instant.now()).withExpiresAt(Instant.now().plus(1, ChronoUnit.HOURS))
                .sign(algorithm);
    }

    public AuthUser verify(String token) {
        try {
            var jwt = verifier.verify(token);
            String id = jwt.getClaim("user_id").asString();
            String role = jwt.getClaim("role").asString();
            if (id == null || id.isBlank() || role == null ||
                    !Set.of("admin", "coordinator", "participant").contains(role)) {
                throw new ApiException(403, "Invalid token.");
            }
            return new AuthUser(id, role);
        } catch (JWTVerificationException | IllegalArgumentException ex) {
            throw new ApiException(403, "Invalid token.");
        }
    }
}
