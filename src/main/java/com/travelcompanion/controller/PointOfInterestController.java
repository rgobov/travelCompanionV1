package com.travelcompanion.controller;

import com.travelcompanion.dto.PointOfInterestDto;
import com.travelcompanion.model.PointOfInterest;
import com.travelcompanion.service.PointOfInterestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PointOfInterestController {
    
    private final PointOfInterestService pointOfInterestService;
    
    @GetMapping("/tours/{tourId}/points")
    public ResponseEntity<List<PointOfInterest>> getPointsByTourId(@PathVariable Long tourId) {
        List<PointOfInterest> points = pointOfInterestService.getPointsByTourId(tourId);
        return ResponseEntity.ok(points);
    }
    
    @GetMapping("/points/{id}")
    public ResponseEntity<PointOfInterest> getPointById(@PathVariable Long id) {
        PointOfInterest point = pointOfInterestService.getPointById(id);
        return ResponseEntity.ok(point);
    }
    
    @PostMapping("/tours/{tourId}/points")
    public ResponseEntity<PointOfInterest> createPoint(
            @PathVariable Long tourId,
            @Valid @RequestBody PointOfInterestDto pointDto) {
        
        // Убедимся, что tourId в URL совпадает с tourId в DTO
        pointDto.setTourId(tourId);
        
        PointOfInterest point = pointOfInterestService.createPoint(pointDto);
        return new ResponseEntity<>(point, HttpStatus.CREATED);
    }
    
    @PutMapping("/points/{id}")
    public ResponseEntity<PointOfInterest> updatePoint(
            @PathVariable Long id,
            @RequestBody PointOfInterestDto pointDto) {
        
        PointOfInterest point = pointOfInterestService.updatePoint(id, pointDto);
        return ResponseEntity.ok(point);
    }
    
    @DeleteMapping("/points/{id}")
    public ResponseEntity<Void> deletePoint(@PathVariable Long id) {
        pointOfInterestService.deletePoint(id);
        return ResponseEntity.noContent().build();
    }
} 