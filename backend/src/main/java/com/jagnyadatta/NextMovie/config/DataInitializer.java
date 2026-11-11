package com.jagnyadatta.NextMovie.config;

import com.jagnyadatta.NextMovie.entity.Theatre;
import com.jagnyadatta.NextMovie.repository.TheatreRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);
    private final TheatreRepository theatreRepository;

    public DataInitializer(TheatreRepository theatreRepository) {
        this.theatreRepository = theatreRepository;
    }

    @Override
    public void run(String... args) {
        if (theatreRepository.findByCityInIgnoreCaseAndActiveTrue(List.of("mumbai"), Pageable.ofSize(1)).isEmpty()) {
            Theatre mumbaiTheatre = new Theatre();
            mumbaiTheatre.setName("PVR ICON Phoenix Palladium");
            mumbaiTheatre.setAddress("462, Senapati Bapat Marg, Lower Parel");
            mumbaiTheatre.setCity("Mumbai");
            mumbaiTheatre.setState("Maharashtra");
            mumbaiTheatre.setPincode("400013");
            mumbaiTheatre.setLatitude(18.995);
            mumbaiTheatre.setLongitude(72.825);
            mumbaiTheatre.setActive(true);
            theatreRepository.save(mumbaiTheatre);
            log.info("Seeded sample Mumbai theatre: PVR ICON Phoenix Palladium");
        }

        if (theatreRepository.findByCityInIgnoreCaseAndActiveTrue(List.of("delhi"), Pageable.ofSize(1)).isEmpty()) {
            Theatre delhiTheatre = new Theatre();
            delhiTheatre.setName("PVR Plaza CP");
            delhiTheatre.setAddress("H-Block, Connaught Place");
            delhiTheatre.setCity("Delhi");
            delhiTheatre.setState("Delhi");
            delhiTheatre.setPincode("110001");
            delhiTheatre.setLatitude(28.632);
            delhiTheatre.setLongitude(77.219);
            delhiTheatre.setActive(true);
            theatreRepository.save(delhiTheatre);
            log.info("Seeded sample Delhi theatre: PVR Plaza CP");
        }
    }
}
