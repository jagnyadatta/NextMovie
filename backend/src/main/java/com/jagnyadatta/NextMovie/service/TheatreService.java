package com.jagnyadatta.NextMovie.service;

import com.jagnyadatta.NextMovie.dto.request.TheatreRequest;
import com.jagnyadatta.NextMovie.dto.response.TheatreResponse;
import com.jagnyadatta.NextMovie.entity.Theatre;
import com.jagnyadatta.NextMovie.exception.ResourceNotFoundException;
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
public class TheatreService {
    private final TheatreRepository theatreRepository;

    @Transactional(readOnly = true)
    public Page<TheatreResponse> getActiveTheatres(Pageable pageable) {
        return theatreRepository
                .findByActiveTrue(pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<TheatreResponse> getTheatresByCity(
            String city,
            Pageable pageable
    ) {
        return theatreRepository
                .findByCityIgnoreCaseAndActiveTrue(city, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public TheatreResponse getByUuid(UUID theatreUuid) {
        return mapToResponse(findTheatre(theatreUuid));
    }

    public TheatreResponse create(TheatreRequest request) {
        if (theatreRepository.existsByNameIgnoreCaseAndCityIgnoreCase(
                request.getName(),
                request.getCity()
        )) {
            throw new IllegalStateException(
                    "Theatre already exists in this city"
            );
        }
        Theatre theatre = new Theatre();
        mapRequestToEntity(request, theatre);
        return mapToResponse(theatreRepository.save(theatre));
    }

    public TheatreResponse update(UUID theatreUuid, TheatreRequest request) {
        Theatre theatre = findTheatre(theatreUuid);
        mapRequestToEntity(request, theatre);
        return mapToResponse(
                theatreRepository.save(theatre)
        );
    }

    public void updateStatus(UUID theatreUuid, boolean active) {
        Theatre theatre = findTheatre(theatreUuid);
        theatre.setActive(active);
        theatreRepository.save(theatre);
    }

    public void delete(UUID theatreUuid) {
        Theatre theatre = findTheatre(theatreUuid);
        theatreRepository.delete(theatre);
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

    private void mapRequestToEntity(TheatreRequest request, Theatre theatre) {
        theatre.setName(request.getName());
        theatre.setAddress(request.getAddress());
        theatre.setCity(request.getCity());
        theatre.setState(request.getState());
        theatre.setPincode(request.getPincode());
        theatre.setLatitude(request.getLatitude());
        theatre.setLongitude(request.getLongitude());
    }

    private TheatreResponse mapToResponse(Theatre theatre) {
        return new TheatreResponse(
                theatre.getTheatreUuid(),
                theatre.getName(),
                theatre.getAddress(),
                theatre.getCity(),
                theatre.getState(),
                theatre.getPincode(),
                theatre.getLatitude(),
                theatre.getLongitude(),
                theatre.getActive(),
                theatre.getCreatedAt(),
                theatre.getUpdatedAt()
        );
    }
}