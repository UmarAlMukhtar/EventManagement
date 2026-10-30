package com.eventmanagement.data;

import com.eventmanagement.api.ApiException;
import java.sql.*;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Repository
public class Store {
    private final JdbcTemplate db;
    public Store(JdbcTemplate db) { this.db = db; }

    public List<Map<String, Object>> rows(String sql, Object... args) {
        return db.query(sql, (rs, row) -> {
            Map<String, Object> values = new LinkedHashMap<>();
            var metadata = rs.getMetaData();
            for (int i = 1; i <= metadata.getColumnCount(); i++) {
                Object value = rs.getObject(i);
                // Match mysql2 JSON strings and retain the snake_case field names.
                if (value instanceof Timestamp timestamp) value = timestamp.toLocalDateTime().toString();
                else if (value instanceof java.sql.Date date) value = date.toLocalDate().toString();
                values.put(metadata.getColumnLabel(i).toLowerCase(Locale.ROOT), value);
            }
            return values;
        }, args);
    }

    public Map<String, Object> one(String sql, String missing, Object... args) {
        var results = rows(sql, args);
        if (results.isEmpty()) throw new ApiException(404, missing);
        return results.get(0);
    }

    public int update(String sql, Object... args) { return db.update(sql, args); }

    /** The row lock lives until the caller's write transaction commits. */
    public String nextId(String entity, String prefix) {
        if (!TransactionSynchronizationManager.isActualTransactionActive()) {
            throw new IllegalStateException("ID allocation requires a transaction");
        }
        Long number = db.queryForObject("SELECT next_value FROM id_sequences WHERE entity = ? FOR UPDATE", Long.class, entity);
        if (number == null || number > 999999999L) throw new ApiException(409, "ID space exhausted");
        db.update("UPDATE id_sequences SET next_value = ? WHERE entity = ?", number + 1, entity);
        return prefix + String.format(Locale.ROOT, "%03d", number);
    }
}
