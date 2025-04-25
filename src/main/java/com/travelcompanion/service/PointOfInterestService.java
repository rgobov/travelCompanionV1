package com.travelcompanion.service;

import com.travelcompanion.dto.PointOfInterestDto;
import com.travelcompanion.model.PointOfInterest;
import com.travelcompanion.model.Tour;
import com.travelcompanion.repository.PointOfInterestRepository;
import com.travelcompanion.repository.TourRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PointOfInterestService {
    
    private final PointOfInterestRepository pointOfInterestRepository;
    private final TourRepository tourRepository;
    
    @Transactional
    public PointOfInterest createPoint(PointOfInterestDto pointDto) {
        Tour tour = tourRepository.findById(pointDto.getTourId())
                .orElseThrow(() -> new RuntimeException("Тур не найден"));
        
        PointOfInterest point = new PointOfInterest();
        point.setTour(tour);
        point.setName(pointDto.getName());
        point.setDescription(pointDto.getDescription());
        point.setLatitude(pointDto.getLatitude());
        point.setLongitude(pointDto.getLongitude());
        point.setPhotoFilename(pointDto.getPhotoFilename());
        point.setAudioFilename(pointDto.getAudioFilename());
        point.setVideoFilename(pointDto.getVideoFilename());
        point.setOrder(pointDto.getOrder());
        
        return pointOfInterestRepository.save(point);
    }
    
    @Transactional(readOnly = true)
    public PointOfInterest getPointById(Long id) {
        return pointOfInterestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Точка интереса не найдена"));
    }
    
    @Transactional(readOnly = true)
    public List<PointOfInterest> getPointsByTour(Tour tour) {
        return pointOfInterestRepository.findByTourOrderByOrderAsc(tour);
    }
    
    @Transactional(readOnly = true)
    public List<PointOfInterest> getPointsByTourId(Long tourId) {
        return pointOfInterestRepository.findByTourIdOrderByOrderAsc(tourId);
    }
    
    @Transactional
    public PointOfInterest updatePoint(Long id, PointOfInterestDto pointDto) {
        PointOfInterest point = getPointById(id);
        
        if (pointDto.getTourId() != null && !pointDto.getTourId().equals(point.getTour().getId())) {
            Tour tour = tourRepository.findById(pointDto.getTourId())
                    .orElseThrow(() -> new RuntimeException("Тур не найден"));
            point.setTour(tour);
        }
        
        if (pointDto.getName() != null) {
            point.setName(pointDto.getName());
        }
        
        point.setDescription(pointDto.getDescription());
        
        if (pointDto.getLatitude() != null) {
            point.setLatitude(pointDto.getLatitude());
        }
        
        if (pointDto.getLongitude() != null) {
            point.setLongitude(pointDto.getLongitude());
        }
        
        point.setPhotoFilename(pointDto.getPhotoFilename());
        point.setAudioFilename(pointDto.getAudioFilename());
        point.setVideoFilename(pointDto.getVideoFilename());
        point.setOrder(pointDto.getOrder());
        
        return pointOfInterestRepository.save(point);
    }
    
    @Transactional
    public void deletePoint(Long id) {
        pointOfInterestRepository.deleteById(id);
    }
    
    @Transactional
    public void deletePointsByTourId(Long tourId) {
        pointOfInterestRepository.deleteByTourId(tourId);
    }
}