package com.travelcompanion.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "points_of_interest")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PointOfInterest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tour_id", nullable = false)
    @NotNull
    private Tour tour;

    @NotBlank
    @Column(nullable = false)
    private String name;

    private String description;

    @NotBlank
    @Column(nullable = false)
    private String latitude;

    @NotBlank
    @Column(nullable = false)
    private String longitude;

    private String photoFilename;

    private String audioFilename;

    private String videoFilename;

    @Column(name = "display_order")
    private Integer order;
} 