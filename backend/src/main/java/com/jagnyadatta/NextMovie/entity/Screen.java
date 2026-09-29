package com.jagnyadatta.NextMovie.entity;

import com.jagnyadatta.NextMovie.enums.ScreenType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(
        name = "screens",
        indexes = {
                @Index(name = "idx_screen_theatre", columnList = "theatre_id")
        },
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_screen_theatre_name",
                        columnNames = {"theatre_id", "name"}
                )
        }
)
public class Screen {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @UuidGenerator
    @Column(
            name = "screen_uuid",
            nullable = false,
            unique = true,
            updatable = false
    )
    private UUID screenUuid;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "theatre_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_screen_theatre")
    )
    private Theatre theatre;

    @Column(nullable = false)
    private Integer totalSeats;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ScreenType screenType;

    @Column(nullable = false)
    private Boolean active = true;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}