package com.travelcompanion.controller;

import com.travelcompanion.dto.UserDto;
import com.travelcompanion.model.User;
import com.travelcompanion.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    
    private final UserService userService;
    
    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@Valid @RequestBody UserDto userDto) {
        // Проверяем, что такой пользователь не существует
        if (userService.existsByUsername(userDto.getUsername())) {
            throw new RuntimeException("Пользователь с таким именем уже существует");
        }
        
        User user = userService.createUser(userDto);
        return new ResponseEntity<>(user, HttpStatus.CREATED);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }
} 