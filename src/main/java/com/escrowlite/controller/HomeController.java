package com.escrowlite.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "login";
    }

    @GetMapping("/login")
    public String login() {
        return "login";
    }

    @GetMapping("/register")
    public String register() {
        return "register";
    }

    @GetMapping("/client-dashboard")
    public String clientDashboard() {
        return "client-dashboard";
    }

    @GetMapping("/freelancer-dashboard")
    public String freelancerDashboard() {
        return "freelancer-dashboard";
    }

    @GetMapping("/dashboard")
    public String dashboard() {
        return "client-dashboard";
    }

    @GetMapping("/projects")
    public String projects() {
        return "projects";
    }
}