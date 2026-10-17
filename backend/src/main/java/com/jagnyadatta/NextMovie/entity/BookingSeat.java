package com.jagnyadatta.NextMovie.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(
        name = "booking_seats",
        indexes = {
                @Index(name = "idx_booking_seat_booking", columnList = "booking_id"),
                @Index(name = "idx_booking_seat_show_seat", columnList = "show_seat_id")
        },
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_booking_show_seat",
                        columnNames = {"booking_id", "show_seat_id"}
                )
        }
)
public class BookingSeat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @UuidGenerator
    @Column(
            name = "booking_seat_uuid",
            nullable = false,
            unique = true,
            updatable = false
    )
    private UUID bookingSeatUuid;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "booking_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_booking_seat_booking")
    )
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "show_seat_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_booking_seat_show_seat")
    )
    private ShowSeat showSeat;

    @Column(nullable = false)
    private Double price;
}