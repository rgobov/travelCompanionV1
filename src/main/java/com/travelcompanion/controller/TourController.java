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
    public ResponseEntity<List<TourDto>> getAllTours() {  // Изменили возвращаемый тип
        List<TourDto> tours = tourService.getAllTours();
        return ResponseEntity.ok(tours);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TourDto> getTourById(@PathVariable Long id) {  // Также изменили здесь
        TourDto tour = tourService.getTourById(id);
        return ResponseEntity.ok(tour);
    }

    @PostMapping
    public ResponseEntity<TourDto> createTour(@Valid @RequestBody TourDto tourDto) {
        TourDto createdTour = tourService.createTour(tourDto);
        return new ResponseEntity<>(createdTour, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TourDto> updateTour(
            @PathVariable Long id,
            @RequestBody TourDto tourDto) {

        TourDto updatedTour = tourService.updateTour(id, tourDto);
        return ResponseEntity.ok(updatedTour);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTour(@PathVariable Long id) {
        tourService.deleteTour(id);
        return ResponseEntity.noContent().build();
    }
}