package com.travelcompanion.service;

import com.travelcompanion.dto.TourDto;
import com.travelcompanion.model.Tour;
import com.travelcompanion.model.User;
import com.travelcompanion.repository.TourRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TourService {

    private final TourRepository tourRepository;
    private final UserService userService;
    private final PointOfInterestService pointOfInterestService;
    private final ModelMapper modelMapper;

    @Transactional
    public TourDto createTour(TourDto tourDto) {
        Tour tour = new Tour();
        tour.setName(tourDto.getName());
        tour.setLocation(tourDto.getLocation());
        tour.setDescription(tourDto.getDescription());

        if (tourDto.getCreatedById() != null) {
            User createdBy = userService.getUserEntityById(tourDto.getCreatedById()); // Изменено здесь
            tour.setCreatedBy(createdBy);
        }

        Tour savedTour = tourRepository.save(tour);
        return modelMapper.map(savedTour, TourDto.class);
    }

    @Transactional(readOnly = true)
    public TourDto getTourById(Long id) {
        Tour tour = tourRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Тур не найден"));
        return modelMapper.map(tour, TourDto.class);
    }

    @Transactional(readOnly = true)
    public List<TourDto> getAllTours() {
        return tourRepository.findAll().stream()
                .map(tour -> modelMapper.map(tour, TourDto.class))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TourDto> getToursByUser(User user) {
        return tourRepository.findByCreatedBy(user).stream()
                .map(tour -> modelMapper.map(tour, TourDto.class))
                .collect(Collectors.toList());
    }

    @Transactional
    public TourDto updateTour(Long id, TourDto tourDto) {
        // 1. Находим тур по ID
        Tour tour = tourRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Тур не найден"));

        // 2. Обновляем основные поля
        if (tourDto.getName() != null) {
            tour.setName(tourDto.getName());
        }

        if (tourDto.getLocation() != null) {
            tour.setLocation(tourDto.getLocation());
        }

        tour.setDescription(tourDto.getDescription());

        // 3. Обновляем создателя (если указан новый ID)
        if (tourDto.getCreatedById() != null) {
            // Используем getUserEntityById() вместо getUserById()
            User createdBy = userService.getUserEntityById(tourDto.getCreatedById());
            tour.setCreatedBy(createdBy);
        }

        // 4. Сохраняем изменения
        Tour updatedTour = tourRepository.save(tour);

        // 5. Возвращаем DTO
        return modelMapper.map(updatedTour, TourDto.class);
    }
    @Transactional
    public void deleteTour(Long id) {
        pointOfInterestService.deletePointsByTourId(id);
        tourRepository.deleteById(id);
    }
}