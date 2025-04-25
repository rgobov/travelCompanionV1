package com.travelcompanion.service;

import com.travelcompanion.dto.PointOfInterestDto;
import com.travelcompanion.model.PointOfInterest;
import com.travelcompanion.model.Tour;
import com.travelcompanion.repository.PointOfInterestRepository;
import com.travelcompanion.repository.TourRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PointOfInterestService {

    private final PointOfInterestRepository pointOfInterestRepository;
    private final TourRepository tourRepository;
    private final ModelMapper modelMapper;

    @Transactional
    public PointOfInterestDto createPoint(PointOfInterestDto pointDto) {
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

        PointOfInterest savedPoint = pointOfInterestRepository.save(point);
        return modelMapper.map(savedPoint, PointOfInterestDto.class);
    }

    @Transactional(readOnly = true)
    public PointOfInterestDto getPointById(Long id) {
        PointOfInterest point = pointOfInterestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Точка интереса не найдена"));
        return modelMapper.map(point, PointOfInterestDto.class);
    }

    @Transactional(readOnly = true)
    public List<PointOfInterestDto> getPointsByTourId(Long tourId) {
        return pointOfInterestRepository.findByTourIdOrderByOrderAsc(tourId).stream()
                .map(point -> modelMapper.map(point, PointOfInterestDto.class))
                .collect(Collectors.toList());
    }

    @Transactional
    public PointOfInterestDto updatePoint(Long id, PointOfInterestDto pointDto) {
        PointOfInterest point = pointOfInterestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Точка интереса не найдена"));

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

        PointOfInterest updatedPoint = pointOfInterestRepository.save(point);
        return modelMapper.map(updatedPoint, PointOfInterestDto.class);
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