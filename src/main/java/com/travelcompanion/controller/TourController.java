package com.travelcompanion.controller;

import com.travelcompanion.dto.TourDto;
import com.travelcompanion.model.Tour;
import com.travelcompanion.service.TourService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tours")
@RequiredArgsConstructor
public class TourController {
    
    private final TourService tourService;
    
    @GetMapping
    public ResponseEntity<List<Tour>> getAllTours() {
        List<Tour> tours = tourService.getAllTours();
        return ResponseEntity.ok(tours);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Tour> getTourById(@PathVariable Long id) {
        Tour tour = tourService.getTourById(id);
        return ResponseEntity.ok(tour);
    }
    
    @PostMapping
    public ResponseEntity<Tour> createTour(@Valid @RequestBody TourDto tourDto) {
        Tour tour = tourService.createTour(tourDto);
        return new ResponseEntity<>(tour, HttpStatus.CREATED);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Tour> updateTour(@PathVariable Long id, @RequestBody TourDto tourDto) {
        Tour updatedTour = tourService.updateTour(id, tourDto);
        return ResponseEntity.ok(updatedTour);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTour(@PathVariable Long id) {
        tourService.deleteTour(id);
        return ResponseEntity.noContent().build();
    }
} 