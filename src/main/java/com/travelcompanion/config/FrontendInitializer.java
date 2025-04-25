package com.travelcompanion.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ResourceLoader;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Configuration
public class FrontendInitializer {

    private final ResourceLoader resourceLoader;
    
    @Value("${app.frontend.dir:client}")
    private String frontendDir;
    
    public FrontendInitializer(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }
    
    @PostConstruct
    public void copyFrontendFiles() throws IOException {
        // Создаем директорию static, если она не существует
        Path staticDir = Paths.get("src/main/resources/static");
        if (!Files.exists(staticDir)) {
            Files.createDirectories(staticDir);
        }
        
        // Исходная директория с файлами фронтенда
        File sourceDir = new File(frontendDir);
        if (sourceDir.exists() && sourceDir.isDirectory()) {
            // Копируем index.html
            Path indexHtmlSource = Paths.get(frontendDir, "index.html");
            if (Files.exists(indexHtmlSource)) {
                Files.copy(indexHtmlSource, 
                          Paths.get("src/main/resources/static/index.html"), 
                          StandardCopyOption.REPLACE_EXISTING);
                System.out.println("Скопирован index.html в static директорию");
            }
            
            // Если есть готовая сборка фронтенда в директории dist
            File distDir = new File("dist");
            if (distDir.exists() && distDir.isDirectory()) {
                copyDirectory(distDir.toPath(), staticDir);
                System.out.println("Содержимое директории dist скопировано в static директорию");
                return;
            }
            
            // Копируем остальные необходимые файлы из директории client
            copyClientFiles();
        } else {
            System.out.println("Директория фронтенда не найдена: " + frontendDir);
        }
    }
    
    private void copyClientFiles() throws IOException {
        Path clientPath = Paths.get(frontendDir);
        Path staticPath = Paths.get("src/main/resources/static");
        
        // Создаем необходимые директории
        Files.createDirectories(staticPath.resolve("src"));
        Files.createDirectories(staticPath.resolve("assets"));
        
        // Копируем CSS и JS файлы в корне client, если они есть
        Files.list(clientPath)
             .filter(path -> {
                 String fileName = path.getFileName().toString();
                 return fileName.endsWith(".css") || fileName.endsWith(".js") || fileName.endsWith(".ico");
             })
             .forEach(path -> {
                 try {
                     Files.copy(path, staticPath.resolve(path.getFileName()), StandardCopyOption.REPLACE_EXISTING);
                     System.out.println("Скопирован файл: " + path.getFileName());
                 } catch (IOException e) {
                     System.err.println("Ошибка при копировании файла " + path + ": " + e.getMessage());
                 }
             });
        
        // Копируем директорию src, если она существует
        Path srcPath = clientPath.resolve("src");
        if (Files.exists(srcPath) && Files.isDirectory(srcPath)) {
            copyDirectory(srcPath, staticPath.resolve("src"));
            System.out.println("Директория src скопирована в static директорию");
        }
        
        // Копируем директорию assets, если она существует
        Path assetsPath = clientPath.resolve("assets");
        if (Files.exists(assetsPath) && Files.isDirectory(assetsPath)) {
            copyDirectory(assetsPath, staticPath.resolve("assets"));
            System.out.println("Директория assets скопирована в static директорию");
        }
    }
    
    private void copyDirectory(Path source, Path target) throws IOException {
        if (!Files.exists(target)) {
            Files.createDirectories(target);
        }
        
        Files.walk(source)
             .forEach(path -> {
                 try {
                     Path targetPath = target.resolve(source.relativize(path));
                     
                     if (Files.isDirectory(path)) {
                         if (!Files.exists(targetPath)) {
                             Files.createDirectory(targetPath);
                         }
                         return;
                     }
                     
                     Files.copy(path, targetPath, StandardCopyOption.REPLACE_EXISTING);
                 } catch (IOException e) {
                     System.err.println("Ошибка при копировании файла " + path + ": " + e.getMessage());
                 }
             });
    }
} 