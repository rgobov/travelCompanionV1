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
    public ResponseEntity<List<PointOfInterestDto>> getPointsByTourId(@PathVariable Long tourId) {
        List<PointOfInterestDto> points = pointOfInterestService.getPointsByTourId(tourId);
        return ResponseEntity.ok(points);
    }

    @GetMapping("/points/{id}")
    public ResponseEntity<PointOfInterestDto> getPointById(@PathVariable Long id) {
        PointOfInterestDto point = pointOfInterestService.getPointById(id);
        return ResponseEntity.ok(point);
    }

    @PostMapping("/tours/{tourId}/points")
    public ResponseEntity<PointOfInterestDto> createPoint(
            @PathVariable Long tourId,
            @Valid @RequestBody PointOfInterestDto pointDto) {

        pointDto.setTourId(tourId);
        PointOfInterestDto createdPoint = pointOfInterestService.createPoint(pointDto);
        return new ResponseEntity<>(createdPoint, HttpStatus.CREATED);
    }

    @PutMapping("/points/{id}")
    public ResponseEntity<PointOfInterestDto> updatePoint(
            @PathVariable Long id,
            @RequestBody PointOfInterestDto pointDto) {

        PointOfInterestDto updatedPoint = pointOfInterestService.updatePoint(id, pointDto);
        return ResponseEntity.ok(updatedPoint);
    }

    @DeleteMapping("/points/{id}")
    public ResponseEntity<Void> deletePoint(@PathVariable Long id) {
        pointOfInterestService.deletePoint(id);
        return ResponseEntity.noContent().build();
    }
}