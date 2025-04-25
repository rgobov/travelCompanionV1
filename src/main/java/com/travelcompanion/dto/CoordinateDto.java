package com.travelcompanion.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CoordinateDto {
    @NotNull(message = "Широта должна быть указана")
    private Double lat;
    
    @NotNull(message = "Долгота должна быть указана")
    private Double lng;
} 