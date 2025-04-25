package com.travelcompanion.repository;

import com.travelcompanion.model.PointOfInterest;
import com.travelcompanion.model.Tour;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PointOfInterestRepository extends JpaRepository<PointOfInterest, Long> {
    List<PointOfInterest> findByTourOrderByOrderAsc(Tour tour);
    List<PointOfInterest> findByTourIdOrderByOrderAsc(Long tourId);
    void deleteByTourId(Long tourId);
} 