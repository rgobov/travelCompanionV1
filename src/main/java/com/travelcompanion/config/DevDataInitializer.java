package com.travelcompanion.config;

import com.travelcompanion.dto.PointOfInterestDto;
import com.travelcompanion.dto.TourDto;
import com.travelcompanion.dto.UserDto;
import com.travelcompanion.model.Tour;
import com.travelcompanion.model.User;
import com.travelcompanion.service.PointOfInterestService;
import com.travelcompanion.service.TourService;
import com.travelcompanion.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@RequiredArgsConstructor
@Profile("dev") // Запускаем только в профиле разработки
public class DevDataInitializer {
    
    private final UserService userService;
    private final TourService tourService;
    private final PointOfInterestService pointOfInterestService;
    
    @Bean
    public CommandLineRunner initDevData() {
        return args -> {
            if (userService.existsByUsername("user")) {
                return; // Данные уже инициализированы
            }
            
            // Создаем тестового пользователя
            UserDto userDto = new UserDto();
            userDto.setUsername("user");
            userDto.setPassword("password");
            User user = userService.createUser(userDto);
            
            // Создаем тестовый тур
            TourDto tourDto = new TourDto();
            tourDto.setName("Прогулка по центру Москвы");
            tourDto.setLocation("Москва");
            tourDto.setDescription("Экскурсия по главным достопримечательностям центра Москвы");
            tourDto.setCreatedById(user.getId());
            Tour tour = tourService.createTour(tourDto);
            
            // Создаем тестовые точки интереса
            PointOfInterestDto point1 = new PointOfInterestDto();
            point1.setTourId(tour.getId());
            point1.setName("Красная площадь");
            point1.setDescription("Главная площадь Москвы");
            point1.setLatitude("55.7539");
            point1.setLongitude("37.6208");
            point1.setOrder(1);
            pointOfInterestService.createPoint(point1);
            
            PointOfInterestDto point2 = new PointOfInterestDto();
            point2.setTourId(tour.getId());
            point2.setName("Храм Василия Блаженного");
            point2.setDescription("Православный храм на Красной площади");
            point2.setLatitude("55.7525");
            point2.setLongitude("37.6231");
            point2.setOrder(2);
            pointOfInterestService.createPoint(point2);
            
            PointOfInterestDto point3 = new PointOfInterestDto();
            point3.setTourId(tour.getId());
            point3.setName("ГУМ");
            point3.setDescription("Главный универсальный магазин");
            point3.setLatitude("55.7546");
            point3.setLongitude("37.6215");
            point3.setOrder(3);
            pointOfInterestService.createPoint(point3);
            
            System.out.println("Тестовые данные успешно инициализированы!");
        };
    }
} 