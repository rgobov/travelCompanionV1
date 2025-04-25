package com.travelcompanion.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // Конфигурация статических ресурсов
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Обрабатываем все статические ресурсы
        registry.addResourceHandler("/assets/**")
                .addResourceLocations("classpath:/static/public/assets/")
                .setCachePeriod(3600); // Кэширование на 1 час
                
        registry.addResourceHandler("/public/**")
                .addResourceLocations("classpath:/static/public/")
                .setCachePeriod(3600);
                
        // Обрабатываем корневые статические ресурсы
        registry.addResourceHandler("/*.js", "/*.css", "/*.map", "/*.html", "/*.ico", "/*.json", "/*.png", "/*.svg")
                .addResourceLocations("classpath:/static/")
                .setCachePeriod(3600);
    }
} 