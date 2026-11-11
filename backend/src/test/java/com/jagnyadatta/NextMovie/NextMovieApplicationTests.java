package com.jagnyadatta.NextMovie;

import com.jagnyadatta.NextMovie.entity.Movie;
import com.jagnyadatta.NextMovie.entity.User;
import com.jagnyadatta.NextMovie.enums.Role;
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

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class NextMovieApplicationTests {

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private com.jagnyadatta.NextMovie.repository.TheatreRepository theatreRepository;

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
}


