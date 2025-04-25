package com.travelcompanion.repository;

import com.travelcompanion.model.Tour;
import com.travelcompanion.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TourRepository extends JpaRepository<Tour, Long> {
    List<Tour> findByCreatedBy(User createdBy);
} 