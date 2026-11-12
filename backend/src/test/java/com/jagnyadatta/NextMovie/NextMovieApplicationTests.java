package com.jagnyadatta.NextMovie;

import com.jagnyadatta.NextMovie.entity.Movie;
import com.jagnyadatta.NextMovie.entity.Screen;
import com.jagnyadatta.NextMovie.entity.Seat;
import com.jagnyadatta.NextMovie.entity.Show;
import com.jagnyadatta.NextMovie.entity.Theatre;
import com.jagnyadatta.NextMovie.entity.User;
import com.jagnyadatta.NextMovie.enums.Role;
import com.jagnyadatta.NextMovie.enums.ShowStatus;
import com.jagnyadatta.NextMovie.enums.UserStatus;
import com.jagnyadatta.NextMovie.repository.MovieRepository;
import com.jagnyadatta.NextMovie.repository.UserRepository;
import com.jagnyadatta.NextMovie.security.AuthUtil;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class NextMovieApplicationTests {

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private com.jagnyadatta.NextMovie.repository.TheatreRepository theatreRepository;

    @Autowired
    private com.jagnyadatta.NextMovie.repository.ScreenRepository screenRepository;

    @Autowired
    private com.jagnyadatta.NextMovie.repository.SeatRepository seatRepository;

    @Autowired
    private com.jagnyadatta.NextMovie.repository.ShowRepository showRepository;

    @Autowired
    private com.jagnyadatta.NextMovie.repository.ShowSeatRepository showSeatRepository;

    @Autowired
    private com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthUtil authUtil;

    @Autowired
    private MockMvc mockMvc;

    private String getOrCreateUserToken(String email, Role role) {
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setName("Test " + role.name());
            newUser.setEmail(email);
            newUser.setPassword("password123");
            newUser.setPhone("1234567890");
            newUser.setRole(role);
            newUser.setStatus(UserStatus.ACTIVE);
            return userRepository.save(newUser);
        });
        return authUtil.generateJwtToken(user);
    }

    @Test
    @DisplayName("Repository: Should find movies containing English in comma-separated language field")
    void testFilterByLanguageEnglish() {
        Pageable pageable = PageRequest.of(0, 12, Sort.by("released").descending());
        Page<Movie> page = movieRepository.findByLanguageIgnoreCase("English", pageable);

        assertNotNull(page);
        assertFalse(page.isEmpty());
        assertTrue(page.getTotalElements() >= 8);

        List<String> titles = page.getContent().stream().map(Movie::getTitle).toList();
        assertTrue(titles.contains("Avengers: Endgame"));
        assertTrue(titles.contains("Inception"));
        assertTrue(titles.contains("Oppenheimer"));
        assertFalse(titles.contains("RRR")); // RRR is Telugu only
    }

    @Test
    @DisplayName("Repository: Should find Avengers: Endgame when searching for Japanese, Xhosa, or German")
    void testFilterByIndividualLanguagesInList() {
        Pageable pageable = PageRequest.of(0, 10, Sort.by("title").ascending());

        // Japanese -> Inception, Avengers: Endgame
        Page<Movie> japanesePage = movieRepository.findByLanguageIgnoreCase("Japanese", pageable);
        List<String> japaneseTitles = japanesePage.getContent().stream().map(Movie::getTitle).toList();
        assertTrue(japaneseTitles.contains("Avengers: Endgame"));
        assertTrue(japaneseTitles.contains("Inception"));

        // Xhosa -> Avengers: Endgame
        Page<Movie> xhosaPage = movieRepository.findByLanguageIgnoreCase("Xhosa", pageable);
        List<String> xhosaTitles = xhosaPage.getContent().stream().map(Movie::getTitle).toList();
        assertTrue(xhosaTitles.contains("Avengers: Endgame"));
        assertEquals(1, xhosaPage.getTotalElements());

        // German -> Oppenheimer, Avengers: Endgame
        Page<Movie> germanPage = movieRepository.findByLanguageIgnoreCase("German", pageable);
        List<String> germanTitles = germanPage.getContent().stream().map(Movie::getTitle).toList();
        assertTrue(germanTitles.contains("Avengers: Endgame"));
        assertTrue(germanTitles.contains("Oppenheimer"));
    }

    @Test
    @DisplayName("Repository: Search must be case-insensitive")
    void testCaseInsensitivity() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Movie> upper = movieRepository.findByLanguageIgnoreCase("XHOSA", pageable);
        Page<Movie> lower = movieRepository.findByLanguageIgnoreCase("xhosa", pageable);
        Page<Movie> mixed = movieRepository.findByLanguageIgnoreCase("XhOsA", pageable);

        assertEquals(1, upper.getTotalElements());
        assertEquals(1, lower.getTotalElements());
        assertEquals(1, mixed.getTotalElements());
        assertEquals("Avengers: Endgame", upper.getContent().get(0).getTitle());
    }

    @Test
    @DisplayName("Repository: Search should match individual languages and not arbitrary partial words")
    void testNoPartialWordMatches() {
        Pageable pageable = PageRequest.of(0, 10);
        // Searching for 'Old English' should not match any movie because none have 'Old English'
        Page<Movie> oldEnglishPage = movieRepository.findByLanguageIgnoreCase("Old English", pageable);
        assertEquals(0, oldEnglishPage.getTotalElements());

        // Searching for 'Eng' (partial of English) should not match English
        Page<Movie> engPage = movieRepository.findByLanguageIgnoreCase("Eng", pageable);
        assertEquals(0, engPage.getTotalElements());

        // Searching for 'man' (partial of German) should not match German
        Page<Movie> manPage = movieRepository.findByLanguageIgnoreCase("man", pageable);
        assertEquals(0, manPage.getTotalElements());
    }

    @Test
    @DisplayName("Repository: Maintain pagination and sorting capabilities")
    void testPaginationAndSorting() {
        Pageable pageable = PageRequest.of(0, 2, Sort.by("imdbRating").descending());
        Page<Movie> page = movieRepository.findByLanguageIgnoreCase("English", pageable);

        assertNotNull(page);
        assertEquals(2, page.getContent().size());
        assertTrue(page.getTotalElements() >= 8);
        assertEquals(0, page.getNumber());
        assertTrue(page.getTotalPages() >= 4);

        // Verify sorting by imdbRating descending
        Double firstRating = page.getContent().get(0).getImdbRating();
        Double secondRating = page.getContent().get(1).getImdbRating();
        if (firstRating != null && secondRating != null) {
            assertTrue(firstRating >= secondRating);
        }
    }

    @Test
    @DisplayName("API: GET /movies/language/English?page=0&size=12 should return 200 and include Avengers: Endgame")
    void testApiEndpointEnglish() throws Exception {
        mockMvc.perform(get("/movies/language/English")
                        .param("page", "0")
                        .param("size", "12")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.message").value("Movies fetched successfully"))
                .andExpect(jsonPath("$.data.content", hasSize(greaterThanOrEqualTo(8))))
                .andExpect(jsonPath("$.data.content[*].title", hasItem("Avengers: Endgame")))
                .andExpect(jsonPath("$.data.content[*].title", not(hasItem("RRR"))));
    }

    @Test
    @DisplayName("API: GET /movies/language/{language} for Japanese, Xhosa, German should include Avengers: Endgame")
    void testApiEndpointIndividualLanguages() throws Exception {
        // Japanese
        mockMvc.perform(get("/movies/language/Japanese")
                        .param("page", "0")
                        .param("size", "12"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[*].title", hasItem("Avengers: Endgame")));

        // Xhosa
        mockMvc.perform(get("/movies/language/Xhosa")
                        .param("page", "0")
                        .param("size", "12"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[*].title", hasItem("Avengers: Endgame")))
                .andExpect(jsonPath("$.data.totalElements").value(1));

        // German
        mockMvc.perform(get("/movies/language/German")
                        .param("page", "0")
                        .param("size", "12"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[*].title", hasItem("Avengers: Endgame")))
                .andExpect(jsonPath("$.data.content[*].title", hasItem("Oppenheimer")));
    }

    @Test
    @DisplayName("API: GET /movies/language/Old%20English should return empty content")
    void testApiEndpointOldEnglishNoMatch() throws Exception {
        mockMvc.perform(get("/movies/language/Old English")
                        .param("page", "0")
                        .param("size", "12"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(0))
                .andExpect(jsonPath("$.data.content", hasSize(0)));
    }

    @Test
    @DisplayName("API: GET /movies/{movieUuid} should be publicly accessible without JWT token (guest)")
    void testGetMovieByUuidWithoutAuth() throws Exception {
        Movie movie = movieRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new IllegalStateException("No movies found in test DB"));

        mockMvc.perform(get("/movies/" + movie.getMovieUuid())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.message").value("Movie fetched successfully"))
                .andExpect(jsonPath("$.data.movieUuid").value(movie.getMovieUuid().toString()))
                .andExpect(jsonPath("$.data.title").value(movie.getTitle()));
    }

    @Test
    @DisplayName("API: GET /movies/{movieUuid} should be accessible with regular USER JWT token")
    void testGetMovieByUuidWithUserToken() throws Exception {
        Movie movie = movieRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new IllegalStateException("No movies found in test DB"));
        String userToken = getOrCreateUserToken("testuser@example.com", Role.USER);

        mockMvc.perform(get("/movies/" + movie.getMovieUuid())
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.data.movieUuid").value(movie.getMovieUuid().toString()));
    }

    @Test
    @DisplayName("API: GET /movies/{movieUuid} should be accessible with ADMIN JWT token")
    void testGetMovieByUuidWithAdminToken() throws Exception {
        Movie movie = movieRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new IllegalStateException("No movies found in test DB"));
        String adminToken = getOrCreateUserToken("testadmin@example.com", Role.ADMIN);

        mockMvc.perform(get("/movies/" + movie.getMovieUuid())
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.data.movieUuid").value(movie.getMovieUuid().toString()));
    }

    @Test
    @DisplayName("Security: Protected mutating endpoints (e.g., DELETE /movies/{movieUuid}) must reject unauthenticated requests with 401")
    void testDeleteMovieRequiresAuth() throws Exception {
        Movie movie = movieRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new IllegalStateException("No movies found in test DB"));

        mockMvc.perform(delete("/movies/" + movie.getMovieUuid()))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value("Authentication required. Please provide a valid JWT token."));
    }

    @Test
    @DisplayName("Security: Protected admin endpoints (e.g., DELETE /movies/{movieUuid}) must reject non-admin users with 403")
    void testDeleteMovieForbiddenForRegularUser() throws Exception {
        Movie movie = movieRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new IllegalStateException("No movies found in test DB"));
        String userToken = getOrCreateUserToken("testuser@example.com", Role.USER);

        mockMvc.perform(delete("/movies/" + movie.getMovieUuid())
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.message").value("You do not have permission to access this resource"));
    }

    @Test
    @DisplayName("Theatres: GET /theatres/city/Bangalore and /theatres/city/Bengaluru return Bangalore theatres")
    void testGetTheatresByBangaloreAndBengaluru() throws Exception {
        mockMvc.perform(get("/theatres/city/Bangalore"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.data.content", hasSize(greaterThanOrEqualTo(3))))
                .andExpect(jsonPath("$.data.content[*].name", hasItem("INOX Multiplex")));

        mockMvc.perform(get("/theatres/city/Bengaluru"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.data.content", hasSize(greaterThanOrEqualTo(3))))
                .andExpect(jsonPath("$.data.content[*].name", hasItem("INOX Multiplex")));
    }

    @Test
    @DisplayName("Theatres: GET /theatres/city/Mumbai returns Mumbai theatres only")
    void testGetTheatresByMumbai() throws Exception {
        mockMvc.perform(get("/theatres/city/Mumbai"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.data.content", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.data.content[*].name", hasItem("PVR ICON Phoenix Palladium")))
                .andExpect(jsonPath("$.data.content[*].name", not(hasItem("INOX Multiplex"))));
    }

    @Test
    @DisplayName("Theatres: GET /theatres/city/Delhi returns Delhi theatres only")
    void testGetTheatresByDelhi() throws Exception {
        mockMvc.perform(get("/theatres/city/Delhi"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.data.content", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.data.content[*].name", hasItem("PVR Plaza CP")))
                .andExpect(jsonPath("$.data.content[*].name", not(hasItem("INOX Multiplex"))));
    }

    @Test
    @DisplayName("Theatres: GET /theatres/city/Hyderabad returns empty content when city has no theatres")
    void testGetTheatresByCityWithNoTheatres() throws Exception {
        mockMvc.perform(get("/theatres/city/Hyderabad"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.data.content", hasSize(0)))
                .andExpect(jsonPath("$.data.totalElements").value(0))
                .andExpect(jsonPath("$.data.empty").value(true));
    }

    @Test
    @DisplayName("Theatres: GET /theatres with city param filters properly and without param returns all theatres")
    void testGetTheatresWithCityQueryParam() throws Exception {
        // With city param
        mockMvc.perform(get("/theatres").param("city", "Mumbai"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.data.content[*].name", hasItem("PVR ICON Phoenix Palladium")))
                .andExpect(jsonPath("$.data.content[*].name", not(hasItem("INOX Multiplex"))));

        // Without city param (all theatres)
        mockMvc.perform(get("/theatres"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.data.content[*].name", hasItem("INOX Multiplex")))
                .andExpect(jsonPath("$.data.content[*].name", hasItem("PVR ICON Phoenix Palladium")));
    }

    @Test
    @DisplayName("Auth: Accessing protected endpoint without token returns 401")
    void testProtectedEndpointWithoutTokenReturns401() throws Exception {
        mockMvc.perform(get("/bookings/my"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value("Authentication required. Please provide a valid JWT token."));
    }

    @Test
    @DisplayName("Auth: Expired JWT token returns 401 with 'JWT token has expired'")
    void testExpiredJwtTokenReturns401() throws Exception {
        User user = userRepository.findByEmail("test_user_expired@example.com").orElseGet(() -> {
            User newUser = new User();
            newUser.setName("Expired User");
            newUser.setEmail("test_user_expired@example.com");
            newUser.setPassword("password123");
            newUser.setPhone("9999988888");
            newUser.setRole(Role.USER);
            newUser.setStatus(UserStatus.ACTIVE);
            return userRepository.save(newUser);
        });

        // Expiration in the past (1 hour ago)
        java.util.Date pastDate = new java.util.Date(System.currentTimeMillis() - 1000 * 60 * 60);
        String expiredToken = authUtil.generateTokenWithExpiration(user, pastDate);

        mockMvc.perform(get("/bookings/my")
                        .header("Authorization", "Bearer " + expiredToken))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value("JWT token has expired"));
    }

    @Test
    @DisplayName("Auth: Malformed/Invalid JWT token returns 401 with 'Invalid JWT token'")
    void testInvalidJwtTokenReturns401() throws Exception {
        mockMvc.perform(get("/bookings/my")
                        .header("Authorization", "Bearer completely.invalid.jwt.token"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value("Invalid JWT token"));
    }

    @Test
    @DisplayName("Auth: Valid JWT token grants access to protected endpoint")
    void testValidJwtTokenAllowsAccess() throws Exception {
        String token = getOrCreateUserToken("valid_user@example.com", Role.USER);

        mockMvc.perform(get("/bookings/my")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200));
    }

    @Test
    @DisplayName("Auth: Public endpoints remain accessible without any token")
    void testPublicEndpointsWithoutToken() throws Exception {
        mockMvc.perform(get("/movies"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200));

        mockMvc.perform(get("/theatres"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200));
    }

    @Test
    @DisplayName("Theatre Admin: Unauthenticated access to /theatres/admin is rejected with 401")
    void testUnauthenticatedAccessToTheatresAdminFails() throws Exception {
        mockMvc.perform(get("/theatres/admin"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    @DisplayName("Theatre Admin: Non-admin USER role access to /theatres/admin is rejected with 403")
    void testNonAdminAccessToTheatresAdminFails() throws Exception {
        String userToken = getOrCreateUserToken("regular_user_theatre@example.com", Role.USER);
        mockMvc.perform(get("/theatres/admin")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }

    @Test
    @DisplayName("Theatre Admin: ADMIN can fetch all theatres, deactivate, and reactivate")
    void testAdminTheatreDeactivationAndReactivation() throws Exception {
        String adminToken = getOrCreateUserToken("admin_theatre_mgr@example.com", Role.ADMIN);

        // 1. Create a dedicated test theatre
        Theatre testTheatre = new Theatre();
        testTheatre.setName("Status Test Multiplex");
        testTheatre.setAddress("123 Test St");
        testTheatre.setCity("Pune");
        testTheatre.setState("Maharashtra");
        testTheatre.setPincode("411001");
        testTheatre.setActive(true);
        testTheatre = theatreRepository.save(testTheatre);
        UUID theatreUuid = testTheatre.getTheatreUuid();

        try {
            // 2. Public endpoint returns the active theatre
            mockMvc.perform(get("/theatres"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.content[*].name", hasItem("Status Test Multiplex")));

            // 3. Admin deactivates theatre: PATCH /theatres/{uuid}/status?active=false
            mockMvc.perform(patch("/theatres/" + theatreUuid + "/status")
                            .header("Authorization", "Bearer " + adminToken)
                            .param("active", "false"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value(200));

            // Verify record still exists in DB and is inactive
            Theatre updated = theatreRepository.findByTheatreUuid(theatreUuid).orElseThrow();
            assertFalse(updated.getActive());

            // 4. Public endpoint GET /theatres now EXCLUDES the deactivated theatre
            mockMvc.perform(get("/theatres"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.content[*].name", not(hasItem("Status Test Multiplex"))));

            // 5. Admin endpoint GET /theatres/admin STILL INCLUDES the deactivated theatre
            mockMvc.perform(get("/theatres/admin")
                            .header("Authorization", "Bearer " + adminToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.content[*].name", hasItem("Status Test Multiplex")))
                    .andExpect(jsonPath("$.data.content[?(@.name == 'Status Test Multiplex')].active").value(false));

            // 6. Admin endpoint with active=false filter includes it
            mockMvc.perform(get("/theatres/admin")
                            .header("Authorization", "Bearer " + adminToken)
                            .param("active", "false"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.content[*].name", hasItem("Status Test Multiplex")));

            // 7. Admin endpoint with active=true filter excludes it
            mockMvc.perform(get("/theatres/admin")
                            .header("Authorization", "Bearer " + adminToken)
                            .param("active", "true"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.content[*].name", not(hasItem("Status Test Multiplex"))));

            // 8. Admin reactivates theatre: PATCH /theatres/{uuid}/status?active=true
            mockMvc.perform(patch("/theatres/" + theatreUuid + "/status")
                            .header("Authorization", "Bearer " + adminToken)
                            .param("active", "true"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value(200));

            // Verify record is active again
            Theatre reactivated = theatreRepository.findByTheatreUuid(theatreUuid).orElseThrow();
            assertTrue(reactivated.getActive());

            // 9. Public endpoint includes it again
            mockMvc.perform(get("/theatres"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.content[*].name", hasItem("Status Test Multiplex")));

        } finally {
            theatreRepository.delete(testTheatre);
        }
    }

    @Test
    @DisplayName("Bulk Seat Generation: Exactly 180 seats created for 180 capacity screen, with idempotency and capacity validation")
    void testBulkSeatGenerationFlow() throws Exception {
        String adminToken = getOrCreateUserToken("admin_seats_test@nextmovie.com", Role.ADMIN);

        // 1. Create a test theatre and screen with capacity 180
        Theatre theatre = new Theatre();
        theatre.setName("Bulk Seat Test Cinema");
        theatre.setCity("Test City");
        theatre.setState("Test State");
        theatre.setAddress("123 Cinema Lane");
        theatre.setPincode("123456");
        theatre.setActive(true);
        Theatre savedTheatre = theatreRepository.save(theatre);

        Screen screen = new Screen();
        screen.setName("Audi 180");
        screen.setTheatre(savedTheatre);
        screen.setTotalSeats(180);
        screen.setScreenType(com.jagnyadatta.NextMovie.enums.ScreenType.IMAX);
        screen.setActive(true);
        Screen savedScreen = screenRepository.save(screen);
        UUID screenUuid = savedScreen.getScreenUuid();

        try {
            // 2. Validate that requesting layout exceeding capacity (11 rows * 18 seats = 198 > 180) returns 400 Bad Request
            com.jagnyadatta.NextMovie.dto.request.BulkSeatGenerateRequest exceedRequest =
                    new com.jagnyadatta.NextMovie.dto.request.BulkSeatGenerateRequest(
                            screenUuid, 11, 18, false
                    );
            mockMvc.perform(post("/seats/bulk-generate")
                            .header("Authorization", "Bearer " + adminToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(exceedRequest)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message", containsString("exceeds screen capacity")));

            // 3. Generate exactly 180 seats (10 rows * 18 seats = 180)
            com.jagnyadatta.NextMovie.dto.request.BulkSeatGenerateRequest validRequest =
                    new com.jagnyadatta.NextMovie.dto.request.BulkSeatGenerateRequest(
                            screenUuid, 10, 18, false
                    );
            mockMvc.perform(post("/seats/bulk-generate")
                            .header("Authorization", "Bearer " + adminToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validRequest)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.status").value(201))
                    .andExpect(jsonPath("$.data.totalSeatsCreated").value(180))
                    .andExpect(jsonPath("$.data.totalSeatsExisting").value(0))
                    .andExpect(jsonPath("$.data.totalSeatsConfigured").value(180))
                    .andExpect(jsonPath("$.data.screenCapacity").value(180))
                    .andExpect(jsonPath("$.data.seats", hasSize(180)));

            // 4. Verify in DB: exactly 180 seats exist
            assertEquals(180, seatRepository.countByScreen_ScreenUuid(screenUuid));

            // Verify screen capacity was NOT mutated!
            Screen refreshedScreen = screenRepository.findByScreenUuid(screenUuid).orElseThrow();
            assertEquals(180, refreshedScreen.getTotalSeats());

            // Verify rows A-J and seat types
            List<com.jagnyadatta.NextMovie.entity.Seat> seats = seatRepository.findByScreen_ScreenUuid(screenUuid);
            assertEquals(180, seats.size());

            // Check Row A has VIP
            long vipCount = seats.stream().filter(s -> s.getSeatType() == com.jagnyadatta.NextMovie.enums.SeatType.VIP).count();
            assertEquals(18, vipCount); // Row A (18 seats)

            // Check Rows B & C have PREMIUM
            long premiumCount = seats.stream().filter(s -> s.getSeatType() == com.jagnyadatta.NextMovie.enums.SeatType.PREMIUM).count();
            assertEquals(36, premiumCount); // Rows B and C (2 * 18 = 36 seats)

            // Check remaining rows D-J have REGULAR
            long regularCount = seats.stream().filter(s -> s.getSeatType() == com.jagnyadatta.NextMovie.enums.SeatType.REGULAR).count();
            assertEquals(126, regularCount); // Rows D-J (7 * 18 = 126 seats)

            // 5. Test idempotency: Calling again with replaceExisting = false creates 0 new seats without 409 Conflict
            mockMvc.perform(post("/seats/bulk-generate")
                            .header("Authorization", "Bearer " + adminToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.totalSeatsCreated").value(0))
                    .andExpect(jsonPath("$.data.totalSeatsExisting").value(180))
                    .andExpect(jsonPath("$.data.totalSeatsConfigured").value(180));

            assertEquals(180, seatRepository.countByScreen_ScreenUuid(screenUuid));

            // 6. Test replaceExisting: Replace with 120 seats (8 rows * 15 seats = 120)
            com.jagnyadatta.NextMovie.dto.request.BulkSeatGenerateRequest replaceRequest =
                    new com.jagnyadatta.NextMovie.dto.request.BulkSeatGenerateRequest(
                            screenUuid, 8, 15, true
                    );
            mockMvc.perform(post("/seats/bulk-generate")
                            .header("Authorization", "Bearer " + adminToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(replaceRequest)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.status").value(201))
                    .andExpect(jsonPath("$.data.totalSeatsCreated").value(120))
                    .andExpect(jsonPath("$.data.totalSeatsConfigured").value(120));

            assertEquals(120, seatRepository.countByScreen_ScreenUuid(screenUuid));

        } finally {
            // Clean up
            List<com.jagnyadatta.NextMovie.entity.Seat> leftoverSeats = seatRepository.findByScreen_ScreenUuid(screenUuid);
            seatRepository.deleteAll(leftoverSeats);
            screenRepository.delete(savedScreen);
            theatreRepository.delete(savedTheatre);
        }
    }

    @Test
    @DisplayName("Single Seat: Does not mutate screen.totalSeats and rejects duplicates with 409")
    void testSingleSeatCreation() throws Exception {
        String adminToken = getOrCreateUserToken("admin_seats_test@nextmovie.com", Role.ADMIN);

        Theatre theatre = new Theatre();
        theatre.setName("Single Seat Test Theatre");
        theatre.setCity("Test City");
        theatre.setState("Test State");
        theatre.setAddress("456 Single St");
        theatre.setPincode("123456");
        theatre.setActive(true);
        Theatre savedTheatre = theatreRepository.save(theatre);

        Screen screen = new Screen();
        screen.setName("Single Audi");
        screen.setTheatre(savedTheatre);
        screen.setTotalSeats(100);
        screen.setScreenType(com.jagnyadatta.NextMovie.enums.ScreenType.STANDARD);
        screen.setActive(true);
        Screen savedScreen = screenRepository.save(screen);
        UUID screenUuid = savedScreen.getScreenUuid();

        try {
            com.jagnyadatta.NextMovie.dto.request.SeatRequest seatRequest =
                    new com.jagnyadatta.NextMovie.dto.request.SeatRequest(
                            screenUuid, "1", "A", com.jagnyadatta.NextMovie.enums.SeatType.VIP
                    );

            // Create seat A1
            mockMvc.perform(post("/seats")
                            .header("Authorization", "Bearer " + adminToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(seatRequest)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.data.seatNumber").value("1"))
                    .andExpect(jsonPath("$.data.rowNumber").value("A"));

            // Verify screen totalSeats is still 100 (NOT incremented to 101!)
            Screen refreshedScreen = screenRepository.findByScreenUuid(screenUuid).orElseThrow();
            assertEquals(100, refreshedScreen.getTotalSeats());

            // Creating the same seat A1 again in the same screen should return 409 Conflict
            mockMvc.perform(post("/seats")
                            .header("Authorization", "Bearer " + adminToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(seatRequest)))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.message", containsString("Seat already exists in this screen")));

            // Creating seat B1 with the same seatNumber "1" but different row "B" should succeed!
            com.jagnyadatta.NextMovie.dto.request.SeatRequest seatB1Request =
                    new com.jagnyadatta.NextMovie.dto.request.SeatRequest(
                            screenUuid, "1", "B", com.jagnyadatta.NextMovie.enums.SeatType.REGULAR
                    );
            mockMvc.perform(post("/seats")
                            .header("Authorization", "Bearer " + adminToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(seatB1Request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.data.seatNumber").value("1"))
                    .andExpect(jsonPath("$.data.rowNumber").value("B"));

            // Verify screen totalSeats is STILL 100
            Screen finalScreen = screenRepository.findByScreenUuid(screenUuid).orElseThrow();
            assertEquals(100, finalScreen.getTotalSeats());

        } finally {
            List<com.jagnyadatta.NextMovie.entity.Seat> leftoverSeats = seatRepository.findByScreen_ScreenUuid(screenUuid);
            seatRepository.deleteAll(leftoverSeats);
            screenRepository.delete(savedScreen);
            theatreRepository.delete(savedTheatre);
        }
    }

    @Test
    @DisplayName("Show Creation: Rejects unsupported 'UPCOMING' status with 400 and allowed values list")
    void testShowCreation_RejectsInvalidUpcomingStatus() throws Exception {
        String adminToken = getOrCreateUserToken("admin_show_test@nextmovie.com", Role.ADMIN);

        // Raw JSON payload containing "status": "UPCOMING"
        String rawPayload = """
            {
                "movieUuid": "%s",
                "screenUuid": "%s",
                "showDate": "%s",
                "startTime": "14:30:00",
                "endTime": "17:15:00",
                "status": "UPCOMING",
                "seatPrices": {
                    "REGULAR": 180.0,
                    "PREMIUM": 280.0
                }
            }
            """.formatted(UUID.randomUUID(), UUID.randomUUID(), java.time.LocalDate.now().plusDays(1));

        mockMvc.perform(post("/shows")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(rawPayload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Invalid value 'UPCOMING' for field 'status'")))
                .andExpect(jsonPath("$.message", containsString("[SCHEDULED, ONGOING, COMPLETED, CANCELLED]")));
    }

    @Test
    @DisplayName("Show Management: Create, List all for Admin, Filter by Status, and Edit Completed Shows")
    void testShowManagementAndEditCompletedShowFlow() throws Exception {
        String adminToken = getOrCreateUserToken("admin_show_mgr@nextmovie.com", Role.ADMIN);
        String userToken = getOrCreateUserToken("regular_user_show@nextmovie.com", Role.USER);

        // 1. Create a test movie, theatre, screen, and seat
        Movie movie = new Movie();
        movie.setTitle("Test Show Movie");
        movie.setGenre("Action");
        movie.setDirector("Test Director");
        movie.setLanguage("English");
        movie.setImdbId("tt" + System.currentTimeMillis());
        Movie savedMovie = movieRepository.save(movie);

        Theatre theatre = new Theatre();
        theatre.setName("Show Test Cinema");
        theatre.setCity("Test City");
        theatre.setState("Test State");
        theatre.setAddress("789 Show Blvd");
        theatre.setPincode("123456");
        theatre.setActive(true);
        Theatre savedTheatre = theatreRepository.save(theatre);

        Screen screen = new Screen();
        screen.setName("Screen 1");
        screen.setTheatre(savedTheatre);
        screen.setTotalSeats(10);
        screen.setScreenType(com.jagnyadatta.NextMovie.enums.ScreenType.STANDARD);
        screen.setActive(true);
        Screen savedScreen = screenRepository.save(screen);

        Seat seat = new Seat();
        seat.setScreen(savedScreen);
        seat.setRowNumber("A");
        seat.setSeatNumber("1");
        seat.setSeatType(com.jagnyadatta.NextMovie.enums.SeatType.REGULAR);
        seat.setActive(true);
        Seat savedSeat = seatRepository.save(seat);

        UUID screenUuid = savedScreen.getScreenUuid();
        UUID movieUuid = savedMovie.getMovieUuid();

        Show futureShow = null;
        Show pastShow = null;

        try {
            // 2. Create a future show with SCHEDULED status
            java.time.LocalDate tomorrow = java.time.LocalDate.now().plusDays(1);
            com.jagnyadatta.NextMovie.dto.request.ShowRequest futureShowRequest =
                    new com.jagnyadatta.NextMovie.dto.request.ShowRequest(
                            movieUuid,
                            screenUuid,
                            tomorrow,
                            java.time.LocalTime.of(14, 0),
                            java.time.LocalTime.of(16, 30),
                            ShowStatus.SCHEDULED,
                            java.util.Map.of("REGULAR", 180.0)
                    );

            String futureResponseJson = mockMvc.perform(post("/shows")
                            .header("Authorization", "Bearer " + adminToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(futureShowRequest)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.data.status").value("SCHEDULED"))
                    .andExpect(jsonPath("$.data.active").value(true))
                    .andReturn().getResponse().getContentAsString();

            UUID futureShowUuid = UUID.fromString(
                    com.jayway.jsonpath.JsonPath.read(futureResponseJson, "$.data.showUuid")
            );
            futureShow = showRepository.findByShowUuid(futureShowUuid).orElseThrow();

            // 3. Create a past show (yesterday) - verify initial status automatically assigns COMPLETED based on date/time
            java.time.LocalDate yesterday = java.time.LocalDate.now().minusDays(1);
            com.jagnyadatta.NextMovie.dto.request.ShowRequest pastShowRequest =
                    new com.jagnyadatta.NextMovie.dto.request.ShowRequest(
                            movieUuid,
                            screenUuid,
                            yesterday,
                            java.time.LocalTime.of(10, 0),
                            java.time.LocalTime.of(12, 30),
                            ShowStatus.SCHEDULED, // Even if requested as SCHEDULED, time is in the past!
                            java.util.Map.of("REGULAR", 150.0)
                    );

            String pastResponseJson = mockMvc.perform(post("/shows")
                            .header("Authorization", "Bearer " + adminToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(pastShowRequest)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.data.status").value("COMPLETED")) // Evaluated to COMPLETED
                    .andExpect(jsonPath("$.data.active").value(true))
                    .andReturn().getResponse().getContentAsString();

            UUID pastShowUuid = UUID.fromString(
                    com.jayway.jsonpath.JsonPath.read(pastResponseJson, "$.data.showUuid")
            );
            pastShow = showRepository.findByShowUuid(pastShowUuid).orElseThrow();

            // 4. Verify public GET /shows excludes the past/completed show
            mockMvc.perform(get("/shows"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.content[*].showUuid", not(hasItem(pastShowUuid.toString()))))
                    .andExpect(jsonPath("$.data.content[*].showUuid", hasItem(futureShowUuid.toString())));

            // 5. Verify admin GET /shows/admin includes BOTH future and past completed shows
            mockMvc.perform(get("/shows/admin")
                            .header("Authorization", "Bearer " + adminToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.content[*].showUuid", hasItem(pastShowUuid.toString())))
                    .andExpect(jsonPath("$.data.content[*].showUuid", hasItem(futureShowUuid.toString())));

            // 6. Verify admin status filtering: GET /shows/admin?status=COMPLETED
            mockMvc.perform(get("/shows/admin")
                            .header("Authorization", "Bearer " + adminToken)
                            .param("status", "COMPLETED"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.content[*].showUuid", hasItem(pastShowUuid.toString())))
                    .andExpect(jsonPath("$.data.content[*].showUuid", not(hasItem(futureShowUuid.toString()))));

            // 7. Verify admin status filtering: GET /shows/admin?status=SCHEDULED
            mockMvc.perform(get("/shows/admin")
                            .header("Authorization", "Bearer " + adminToken)
                            .param("status", "SCHEDULED"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.content[*].showUuid", hasItem(futureShowUuid.toString())))
                    .andExpect(jsonPath("$.data.content[*].showUuid", not(hasItem(pastShowUuid.toString()))));

            // 8. Verify non-admin access to /shows/admin is rejected with 403 Forbidden
            mockMvc.perform(get("/shows/admin")
                            .header("Authorization", "Bearer " + userToken))
                    .andExpect(status().isForbidden());

            // 9. Edit the previously COMPLETED show:
            // Reschedule it to day-after-tomorrow from 19:00 to 21:30 and update price to 220.0
            java.time.LocalDate dayAfterTomorrow = java.time.LocalDate.now().plusDays(2);
            com.jagnyadatta.NextMovie.dto.request.ShowRequest updateRequest =
                    new com.jagnyadatta.NextMovie.dto.request.ShowRequest(
                            movieUuid,
                            screenUuid,
                            dayAfterTomorrow,
                            java.time.LocalTime.of(19, 0),
                            java.time.LocalTime.of(21, 30),
                            ShowStatus.COMPLETED, // previously COMPLETED
                            java.util.Map.of("REGULAR", 220.0)
                    );

            mockMvc.perform(put("/shows/" + pastShowUuid)
                            .header("Authorization", "Bearer " + adminToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(updateRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value(200))
                    .andExpect(jsonPath("$.data.showDate").value(dayAfterTomorrow.toString()))
                    .andExpect(jsonPath("$.data.status").value("SCHEDULED")) // transitioned to SCHEDULED!
                    .andExpect(jsonPath("$.data.active").value(true));

            // 10. Test overlap validation on update:
            // Attempting to schedule another show overlapping with futureShow (14:00 - 16:30 tomorrow) on the same screen
            com.jagnyadatta.NextMovie.dto.request.ShowRequest overlapRequest =
                    new com.jagnyadatta.NextMovie.dto.request.ShowRequest(
                            movieUuid,
                            screenUuid,
                            tomorrow,
                            java.time.LocalTime.of(15, 0),
                            java.time.LocalTime.of(17, 0),
                            ShowStatus.SCHEDULED,
                            java.util.Map.of("REGULAR", 180.0)
                    );

            mockMvc.perform(post("/shows")
                            .header("Authorization", "Bearer " + adminToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(overlapRequest)))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.message", containsString("Another show is already scheduled on this screen during this time")));

        } finally {
            // Clean up
            if (futureShow != null) {
                showSeatRepository.deleteAll(showSeatRepository.findByShow_ShowUuid(futureShow.getShowUuid(), Pageable.unpaged()).getContent());
                showRepository.delete(futureShow);
            }
            if (pastShow != null) {
                showSeatRepository.deleteAll(showSeatRepository.findByShow_ShowUuid(pastShow.getShowUuid(), Pageable.unpaged()).getContent());
                showRepository.delete(pastShow);
            }
            seatRepository.delete(savedSeat);
            screenRepository.delete(savedScreen);
            theatreRepository.delete(savedTheatre);
            movieRepository.delete(savedMovie);
        }
    }
}


