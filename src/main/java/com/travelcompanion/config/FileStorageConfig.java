package com.travelcompanion.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class FileStorageConfig {

    @Bean
    public String uploadDirectory(Environment env) throws IOException {
        // Попытка получить значение из свойств
        String uploadDir = env.getProperty("app.upload.dir");
        
        // Если значение не найдено, используем значение по умолчанию
        if (uploadDir == null || uploadDir.isEmpty()) {
            uploadDir = "uploads";
        }
        
        // Создание директории, если она не существует
        Path path = Paths.get(uploadDir);
        Files.createDirectories(path);
        
        // Создание поддиректорий
        Files.createDirectories(path.resolve("photos"));
        Files.createDirectories(path.resolve("audio"));
        Files.createDirectories(path.resolve("videos"));
        
        return uploadDir;
    }
} 