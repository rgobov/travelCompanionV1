package com.travelcompanion.controller;

import com.travelcompanion.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class FileController {
    
    private final FileStorageService fileStorageService;
    
    @PostMapping("/upload/photo")
    public ResponseEntity<Map<String, String>> uploadPhoto(@RequestParam("photo") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new RuntimeException("Файл не может быть пустым");
        }
        
        // Проверяем, что файл является изображением
        if (!file.getContentType().startsWith("image/")) {
            throw new RuntimeException("Файл должен быть изображением");
        }
        
        String filename = fileStorageService.savePhoto(file);
        
        Map<String, String> response = new HashMap<>();
        response.put("filename", filename);
        response.put("path", "/api/media/photos/" + filename);
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/upload/audio")
    public ResponseEntity<Map<String, String>> uploadAudio(@RequestParam("audio") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new RuntimeException("Файл не может быть пустым");
        }
        
        // Проверяем, что файл является аудио
        if (!file.getContentType().startsWith("audio/")) {
            throw new RuntimeException("Файл должен быть аудио");
        }
        
        String filename = fileStorageService.saveAudio(file);
        
        Map<String, String> response = new HashMap<>();
        response.put("filename", filename);
        response.put("path", "/api/media/audio/" + filename);
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/upload/video")
    public ResponseEntity<Map<String, String>> uploadVideo(@RequestParam("video") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new RuntimeException("Файл не может быть пустым");
        }
        
        // Проверяем, что файл является видео
        if (!file.getContentType().startsWith("video/")) {
            throw new RuntimeException("Файл должен быть видео");
        }
        
        String filename = fileStorageService.saveVideo(file);
        
        Map<String, String> response = new HashMap<>();
        response.put("filename", filename);
        response.put("path", "/api/media/videos/" + filename);
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/photos/{filename}")
    public ResponseEntity<Resource> getPhoto(@PathVariable String filename) throws IOException {
        Path filePath = fileStorageService.getPhotoPath(filename);
        Resource resource = new UrlResource(filePath.toUri());
        
        if (resource.exists() && resource.isReadable()) {
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } else {
            throw new RuntimeException("Не удалось найти файл: " + filename);
        }
    }
    
    @GetMapping("/audio/{filename}")
    public ResponseEntity<Resource> getAudio(@PathVariable String filename) throws IOException {
        Path filePath = fileStorageService.getAudioPath(filename);
        Resource resource = new UrlResource(filePath.toUri());
        
        if (resource.exists() && resource.isReadable()) {
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType("audio/mpeg"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } else {
            throw new RuntimeException("Не удалось найти файл: " + filename);
        }
    }
    
    @GetMapping("/videos/{filename}")
    public ResponseEntity<Resource> getVideo(@PathVariable String filename) throws IOException {
        Path filePath = fileStorageService.getVideoPath(filename);
        Resource resource = new UrlResource(filePath.toUri());
        
        if (resource.exists() && resource.isReadable()) {
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType("video/mp4"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } else {
            throw new RuntimeException("Не удалось найти файл: " + filename);
        }
    }
} 