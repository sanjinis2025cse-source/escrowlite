package com.escrowlite.dto;

import com.escrowlite.entity.UserRole;

public class LoginResponse {

    private boolean success;
    private String message;
    private Long userId;
    private String name;
    private String email;
    private UserRole role;

    public LoginResponse() {
    }

    public LoginResponse(boolean success,
                         String message,
                         Long userId,
                         String name,
                         String email,
                         UserRole role) {
        this.success = success;
        this.message = message;
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.role = role;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }
}