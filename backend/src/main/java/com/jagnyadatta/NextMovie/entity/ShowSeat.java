package com.jagnyadatta.NextMovie.entity;

import com.jagnyadatta.NextMovie.enums.ShowSeatStatus;
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
        name = "show_seats",
        indexes = {
                @Index(name = "idx_show_seat_show", columnList = "show_id"),
                @Index(name = "idx_show_seat_seat", columnList = "seat_id"),
                @Index(name = "idx_show_seat_status", columnList = "status")
        },
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_show_seat",
                        columnNames = {"show_id", "seat_id"}
                )
        }
)
public class ShowSeat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @UuidGenerator
    @Column(
            name = "show_seat_uuid",
            nullable = false,
            unique = true,
            updatable = false
    )
    private UUID showSeatUuid;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "show_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_show_seat_show")
    )
    private Show show;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "seat_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_show_seat_seat")
    )
    private Seat seat;

    @Column(nullable = false)
    private Double price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ShowSeatStatus status;

    private LocalDateTime lockedAt;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}