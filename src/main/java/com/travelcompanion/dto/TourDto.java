package com.travelcompanion.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TourDto {
    private Long id;
    
    @NotBlank(message = "Название тура не может быть пустым")
    private String name;
    
    @NotBlank(message = "Локация не может быть пустой")
    private String location;
    
    private String description;
    
    private Long createdById;
} 