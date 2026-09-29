package com.jagnyadatta.NextMovie.service;

import com.jagnyadatta.NextMovie.dto.request.ScreenRequest;
import com.jagnyadatta.NextMovie.dto.response.ScreenResponse;
import com.jagnyadatta.NextMovie.entity.Screen;
import com.jagnyadatta.NextMovie.entity.Theatre;
import com.jagnyadatta.NextMovie.exception.ResourceNotFoundException;
import com.jagnyadatta.NextMovie.repository.ScreenRepository;
import com.jagnyadatta.NextMovie.repository.TheatreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ScreenService {
    private final ScreenRepository screenRepository;
    private final TheatreRepository theatreRepository;

    @Transactional(readOnly = true)
    public Page<ScreenResponse> getScreensByTheatre(
            UUID theatreUuid,
            Pageable pageable
    ) {
        return screenRepository
                .findByTheatre_TheatreUuidAndActiveTrue(
                        theatreUuid,
                        pageable
                )
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public ScreenResponse getByUuid(UUID screenUuid) {
        return mapToResponse(findScreen(screenUuid));
    }

    public ScreenResponse create(ScreenRequest request) {
        Theatre theatre = findTheatre(request.getTheatreUuid());
        if (screenRepository
                .existsByTheatre_TheatreUuidAndNameIgnoreCase(
                        request.getTheatreUuid(),
                        request.getName()
                )) {
            throw new IllegalStateException(
                    "Screen with this name already exists in the theatre"
            );
        }

        Screen screen = new Screen();
        screen.setName(request.getName());
        screen.setTheatre(theatre);
        screen.setTotalSeats(request.getTotalSeats());
        screen.setScreenType(request.getScreenType());
        return mapToResponse(
                screenRepository.save(screen)
        );
    }

    public ScreenResponse update(
            UUID screenUuid,
            ScreenRequest request
    ) {
        Screen screen = findScreen(screenUuid);
        Theatre theatre = findTheatre(request.getTheatreUuid());
        screen.setName(request.getName());
        screen.setTheatre(theatre);
        screen.setTotalSeats(request.getTotalSeats());
        screen.setScreenType(request.getScreenType());
        return mapToResponse(
                screenRepository.save(screen)
        );
    }

    public void updateStatus(
            UUID screenUuid,
            boolean active
    ) {
        Screen screen = findScreen(screenUuid);
        screen.setActive(active);
        screenRepository.save(screen);
    }

    public void delete(UUID screenUuid) {
        screenRepository.delete(findScreen(screenUuid));
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

    private Theatre findTheatre(UUID theatreUuid) {
        return theatreRepository
                .findByTheatreUuid(theatreUuid)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Theatre not found with UUID: "
                                        + theatreUuid
                        )
                );
    }

    private ScreenResponse mapToResponse(Screen screen) {
        return new ScreenResponse(
                screen.getScreenUuid(),
                screen.getName(),
                screen.getTheatre().getTheatreUuid(),
                screen.getTheatre().getName(),
                screen.getTotalSeats(),
                screen.getScreenType(),
                screen.getActive(),
                screen.getCreatedAt(),
                screen.getUpdatedAt()
        );
    }
}