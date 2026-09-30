package com.jagnyadatta.NextMovie.entity;

import com.jagnyadatta.NextMovie.enums.SeatType;
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
        name = "seats",
        indexes = {
                @Index(name = "idx_seat_screen", columnList = "screen_id")
        },
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_seat_screen_number",
                        columnNames = {"screen_id", "seat_number"}
                )
        }
)
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @UuidGenerator
    @Column(
            name = "seat_uuid",
            nullable = false,
            unique = true,
            updatable = false
    )
    private UUID seatUuid;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "screen_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_seat_screen")
    )
    private Screen screen;

    @Column(
            name = "seat_number",
            nullable = false,
            length = 10
    )
    private String seatNumber;

    @Column(
            name = "row_number",
            nullable = false,
            length = 5
    )
    private String rowNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private SeatType seatType;

    @Column(nullable = false)
    private Boolean active = true;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}