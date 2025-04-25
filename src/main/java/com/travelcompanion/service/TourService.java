package com.travelcompanion.service;

import com.travelcompanion.dto.TourDto;
import com.travelcompanion.model.Tour;
import com.travelcompanion.model.User;
import com.travelcompanion.repository.TourRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TourService {
    
    private final TourRepository tourRepository;
    private final UserService userService;
    private final PointOfInterestService pointOfInterestService;
    
    @Transactional
    public Tour createTour(TourDto tourDto) {
        Tour tour = new Tour();
        tour.setName(tourDto.getName());
        tour.setLocation(tourDto.getLocation());
        tour.setDescription(tourDto.getDescription());
        
        if (tourDto.getCreatedById() != null) {
            User createdBy = userService.getUserById(tourDto.getCreatedById());
            tour.setCreatedBy(createdBy);
        }
        
        return tourRepository.save(tour);
    }
    
    @Transactional(readOnly = true)
    public Tour getTourById(Long id) {
        return tourRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Тур не найден"));
    }
    
    @Transactional(readOnly = true)
    public List<Tour> getAllTours() {
        return tourRepository.findAll();
    }
    
    @Transactional(readOnly = true)
    public List<Tour> getToursByUser(User user) {
        return tourRepository.findByCreatedBy(user);
    }
    
    @Transactional
    public Tour updateTour(Long id, TourDto tourDto) {
        Tour tour = getTourById(id);
        
        if (tourDto.getName() != null) {
            tour.setName(tourDto.getName());
        }
        
        if (tourDto.getLocation() != null) {
            tour.setLocation(tourDto.getLocation());
        }
        
        tour.setDescription(tourDto.getDescription());
        
        if (tourDto.getCreatedById() != null) {
            User createdBy = userService.getUserById(tourDto.getCreatedById());
            tour.setCreatedBy(createdBy);
        }
        
        return tourRepository.save(tour);
    }
    
    @Transactional
    public void deleteTour(Long id) {
        // Удаляем все связанные точки интереса
        pointOfInterestService.deletePointsByTourId(id);
        
        // Удаляем сам тур
        tourRepository.deleteById(id);
    }
}