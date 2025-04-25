package com.travelcompanion.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PointOfInterestDto {
    private Long id;
    
    @NotNull(message = "ID тура должен быть указан")
    private Long tourId;
    
    @NotBlank(message = "Название точки не может быть пустым")
    private String name;
    
    private String description;
    
    @NotBlank(message = "Широта должна быть указана")
    private String latitude;
    
    @NotBlank(message = "Долгота должна быть указана")
    private String longitude;
    
    private String photoFilename;
    
    private String audioFilename;
    
    private String videoFilename;
    
    private Integer order;
} 