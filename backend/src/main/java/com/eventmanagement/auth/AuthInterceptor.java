package com.eventmanagement.auth;

import com.eventmanagement.api.ApiException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Arrays;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuthInterceptor implements HandlerInterceptor {
    private final TokenService tokens;
    private final JdbcTemplate db;

    public AuthInterceptor(TokenService tokens, JdbcTemplate db) { this.tokens = tokens; this.db = db; }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (!(handler instanceof HandlerMethod method)) return true;
        Access access = method.getMethodAnnotation(Access.class);
        if (access == null) access = method.getBeanType().getAnnotation(Access.class);
        if (access == null) return true;
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ") || header.substring(7).isBlank()) {
            throw new ApiException(401, "Access denied. No token provided.");
        }
        AuthUser claims = tokens.verify(header.substring(7));
        var roles = db.queryForList("SELECT role FROM users WHERE user_id = ?", String.class, claims.userId());
        if (roles.isEmpty()) throw new ApiException(403, "Invalid token.");
        // Use the current role so deleted users and stale admin tokens lose access.
        AuthUser user = new AuthUser(claims.userId(), roles.get(0));
        if (access.value().length > 0 && !Arrays.asList(access.value()).contains(user.role())) {
            throw new ApiException(403, "Forbidden: insufficient permissions");
        }
        request.setAttribute("authUser", user);
        return true;
    }
}
