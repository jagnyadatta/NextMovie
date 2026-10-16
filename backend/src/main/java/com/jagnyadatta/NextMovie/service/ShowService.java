package com.jagnyadatta.NextMovie.service;

import com.jagnyadatta.NextMovie.dto.request.ShowRequest;
import com.jagnyadatta.NextMovie.dto.response.ShowResponse;
import com.jagnyadatta.NextMovie.entity.*;
import com.jagnyadatta.NextMovie.enums.ShowSeatStatus;
import com.jagnyadatta.NextMovie.enums.ShowStatus;
import com.jagnyadatta.NextMovie.exception.ResourceNotFoundException;
import com.jagnyadatta.NextMovie.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ShowService {
    private final ShowRepository showRepository;
    private final ShowSeatRepository showSeatRepository;
    private final MovieRepository movieRepository;
    private final ScreenRepository screenRepository;
    private final SeatRepository seatRepository;

    @Transactional(readOnly = true)
    public Page<ShowResponse> getShows(LocalDate date, Pageable pageable) {
        return showRepository
                .findByActiveTrueAndShowDateGreaterThanEqual(
                        date,
                        pageable
                )
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<ShowResponse> getShowsByMovie(
            UUID movieUuid,
            LocalDate date,
            Pageable pageable
    ) {
        return showRepository
                .findByMovie_MovieUuidAndActiveTrueAndShowDateGreaterThanEqual(
                        movieUuid,
                        date,
                        pageable
                )
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<ShowResponse> getShowsByTheatre(
            UUID theatreUuid,
            LocalDate date,
            Pageable pageable
    ) {
        return showRepository
                .findByScreen_Theatre_TheatreUuidAndActiveTrueAndShowDateGreaterThanEqual(
                        theatreUuid,
                        date,
                        pageable
                )
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<ShowResponse> getShowsByCity(
            String city,
            LocalDate date,
            Pageable pageable
    ) {
        return showRepository
                .findByScreen_Theatre_CityIgnoreCaseAndActiveTrueAndShowDateGreaterThanEqual(
                        city,
                        date,
                        pageable
                )
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public ShowResponse getByUuid(UUID showUuid) {
        return mapToResponse(findShow(showUuid));
    }

    public ShowResponse create(ShowRequest request) {
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new IllegalStateException(
                    "End time must be after start time"
            );
        }
        Movie movie = findMovie(request.getMovieUuid());
        Screen screen = findScreen(request.getScreenUuid());
        boolean overlap =
                showRepository.existsOverlappingShow(
                        request.getScreenUuid(),
                        request.getShowDate(),
                        request.getStartTime(),
                        request.getEndTime(),
                        ShowStatus.CANCELLED
                );

        if (overlap) {
            throw new IllegalStateException(
                    "Another show is already scheduled on this screen during this time"
            );
        }

        Show show = new Show();

        show.setMovie(movie);
        show.setScreen(screen);
        show.setShowDate(request.getShowDate());
        show.setStartTime(request.getStartTime());
        show.setEndTime(request.getEndTime());

        show.setStatus(
                request.getStatus() != null ? request.getStatus() : ShowStatus.SCHEDULED
        );

        Show savedShow = showRepository.save(show);

        createShowSeats(
                savedShow,
                screen,
                request.getSeatPrices()
        );

        return mapToResponse(savedShow);
    }

    public ShowResponse update(UUID showUuid, ShowRequest request) {
        Show show = findShow(showUuid);

        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new IllegalStateException(
                    "End time must be after start time"
            );
        }

        boolean overlap =
                showRepository.existsOverlappingShow(
                        request.getScreenUuid(),
                        request.getShowDate(),
                        request.getStartTime(),
                        request.getEndTime(),
                        ShowStatus.CANCELLED
                );

        if (overlap && !show.getScreen()
                .getScreenUuid()
                .equals(request.getScreenUuid())) {

            throw new IllegalStateException(
                    "Another show is already scheduled during this time"
            );
        }

        show.setMovie(findMovie(request.getMovieUuid()));
        show.setScreen(findScreen(request.getScreenUuid()));
        show.setShowDate(request.getShowDate());
        show.setStartTime(request.getStartTime());
        show.setEndTime(request.getEndTime());

        if (request.getStatus() != null) {
            show.setStatus(request.getStatus());
        }

        return mapToResponse(
                showRepository.save(show)
        );
    }

    public void updateStatus(UUID showUuid, ShowStatus status) {
        Show show = findShow(showUuid);
        show.setStatus(status);

        if (status == ShowStatus.SCHEDULED) {
            show.setActive(true);
        }

        if (status == ShowStatus.CANCELLED) {
            show.setActive(false);
        }
        showRepository.save(show);
    }

    public void delete(UUID showUuid) {
        Show show = findShow(showUuid);
        showRepository.delete(show);
    }

    private void createShowSeats(
            Show show,
            Screen screen,
            Map<String, Double> seatPrices
    ) {
        List<Seat> seats =
                seatRepository
                        .findByScreen_ScreenUuidAndActiveTrue(
                                screen.getScreenUuid(),
                                Pageable.unpaged()
                        )
                        .getContent();

        if (seats.isEmpty()) {
            throw new IllegalStateException(
                    "Cannot create show because the screen has no active seats"
            );
        }

        List<ShowSeat> showSeats = seats.stream()
                .map(seat -> {
                    ShowSeat showSeat = new ShowSeat();
                    showSeat.setShow(show);
                    showSeat.setSeat(seat);
                    Double price = getSeatPrice(seat, seatPrices);
                    showSeat.setPrice(price);
                    showSeat.setStatus(
                            ShowSeatStatus.AVAILABLE
                    );
                    return showSeat;
                })
                .toList();

        showSeatRepository.saveAll(showSeats);
    }

    private Double getSeatPrice(
            Seat seat,
            Map<String, Double> seatPrices
    ) {
        if (seatPrices == null || seatPrices.isEmpty()) {
            throw new IllegalArgumentException(
                    "Seat prices are required"
            );
        }

        Double price =
                seatPrices.get(
                        seat.getSeatType().name()
                );
        if (price == null || price <= 0) {
            throw new IllegalArgumentException(
                    "Price not configured for seat type: "
                            + seat.getSeatType()
            );
        }
        return price;
    }

    private Show findShow(UUID showUuid) {
        return showRepository
                .findByShowUuid(showUuid)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Show not found with UUID: "
                                        + showUuid
                        )
                );
    }

    private Movie findMovie(UUID movieUuid) {
        return movieRepository
                .findByMovieUuid(movieUuid)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Movie not found with UUID: "
                                        + movieUuid
                        )
                );
    }

    private Screen findScreen(UUID screenUuid) {
        return screenRepository
                .findByScreenUuid(screenUuid)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Screen not found with UUID: "
                                        + screenUuid
                        )
                );
    }

    private ShowResponse mapToResponse(Show show) {

        return new ShowResponse(
                show.getShowUuid(),
                show.getMovie().getMovieUuid(),
                show.getMovie().getTitle(),
                show.getScreen().getScreenUuid(),
                show.getScreen().getName(),
                show.getScreen().getTheatre().getTheatreUuid(),
                show.getScreen().getTheatre().getName(),
                show.getShowDate(),
                show.getStartTime(),
                show.getEndTime(),
                show.getStatus(),
                show.getActive(),
                show.getCreatedAt(),
                show.getUpdatedAt()
        );
    }
}