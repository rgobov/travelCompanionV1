package com.travelcompanion.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStorageService {
    
    private final String uploadDir;
    private final Path photosPath;
    private final Path audioPath;
    private final Path videoPath;
    
    // Инициализация директорий при создании сервиса
    @Autowired
    public FileStorageService(String uploadDirectory) throws IOException {
        this.uploadDir = uploadDirectory;
        
        Path baseDir = Paths.get(uploadDir);
        this.photosPath = baseDir.resolve("photos");
        this.audioPath = baseDir.resolve("audio");
        this.videoPath = baseDir.resolve("videos");
        
        // Директории уже должны быть созданы в FileStorageConfig
    }
    
    /**
     * Сохраняет фото и возвращает имя файла
     */
    public String savePhoto(MultipartFile file) throws IOException {
        return saveFile(file, photosPath);
    }
    
    /**
     * Сохраняет аудио и возвращает имя файла
     */
    public String saveAudio(MultipartFile file) throws IOException {
        return saveFile(file, audioPath);
    }
    
    /**
     * Сохраняет видео и возвращает имя файла
     */
    public String saveVideo(MultipartFile file) throws IOException {
        return saveFile(file, videoPath);
    }
    
    /**
     * Общий метод для сохранения файла в указанную директорию
     */
    private String saveFile(MultipartFile file, Path directory) throws IOException {
        // Получаем расширение файла
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        
        // Генерируем уникальное имя файла
        String filename = UUID.randomUUID() + extension;
        
        // Сохраняем файл
        Path targetPath = directory.resolve(filename);
        Files.copy(file.getInputStream(), targetPath);
        
        return filename;
    }
    
    /**
     * Получает полный путь к фото по имени файла
     */
    public Path getPhotoPath(String filename) {
        return photosPath.resolve(filename);
    }
    
    /**
     * Получает полный путь к аудио по имени файла
     */
    public Path getAudioPath(String filename) {
        return audioPath.resolve(filename);
    }
    
    /**
     * Получает полный путь к видео по имени файла
     */
    public Path getVideoPath(String filename) {
        return videoPath.resolve(filename);
    }
    
    /**
     * Удаляет файл по имени и типу
     */
    public boolean deleteFile(String filename, String type) throws IOException {
        Path path;
        
        switch (type) {
            case "photo":
                path = getPhotoPath(filename);
                break;
            case "audio":
                path = getAudioPath(filename);
                break;
            case "video":
                path = getVideoPath(filename);
                break;
            default:
                return false;
        }
        
        if (Files.exists(path)) {
            Files.delete(path);
            return true;
        }
        
        return false;
    }
} 