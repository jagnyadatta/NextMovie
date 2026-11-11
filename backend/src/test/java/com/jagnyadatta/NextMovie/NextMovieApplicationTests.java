package com.jagnyadatta.NextMovie;

import com.jagnyadatta.NextMovie.entity.Movie;
import com.jagnyadatta.NextMovie.repository.MovieRepository;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class NextMovieApplicationTests {

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private MockMvc mockMvc;

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
}


