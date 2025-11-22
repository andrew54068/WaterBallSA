package com.waterballsa.backend.repository;

import com.waterballsa.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for User entity operations.
 *
 * Provides database access methods for user management including:
 * - Finding users by Google ID or email
 * - Leaderboard queries (Phase 3)
 * - User statistics queries
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Finds a user by their Google OAuth ID.
     *
     * @param googleId the Google OAuth ID
     * @return an Optional containing the user if found
     */
    Optional<User> findByGoogleId(String googleId);

    /**
     * Finds a user by their email address.
     *
     * @param email the email address
     * @return an Optional containing the user if found
     */
    Optional<User> findByEmail(String email);

    /**
     * Checks if a user exists with the given Google ID.
     *
     * @param googleId the Google OAuth ID
     * @return true if a user exists with this Google ID
     */
    boolean existsByGoogleId(String googleId);

    /**
     * Checks if a user exists with the given email.
     *
     * @param email the email address
     * @return true if a user exists with this email
     */
    boolean existsByEmail(String email);

    /**
     * Finds top users by total experience for leaderboard (Phase 3).
     *
     * @param pageable pagination information
     * @return page of users ordered by total EXP descending
     */
    Page<User> findAllByOrderByTotalExpDesc(Pageable pageable);

    /**
     * Finds top N users for leaderboard (Phase 3).
     *
     * @param limit the number of top users to retrieve
     * @return list of top users ordered by total EXP descending
     */
    @Query("SELECT u FROM User u ORDER BY u.totalExp DESC, u.id ASC")
    List<User> findTopUsers(@Param("limit") int limit);

    /**
     * Counts users with experience points greater than or equal to the given amount.
     * Used for calculating global rank (Phase 3).
     *
     * @param totalExp the experience threshold
     * @return count of users with at least this much EXP
     */
    long countByTotalExpGreaterThanEqual(Integer totalExp);

    /**
     * Finds users by name containing the search term (case-insensitive).
     *
     * @param name the search term
     * @param pageable pagination information
     * @return page of matching users
     */
    Page<User> findByNameContainingIgnoreCase(String name, Pageable pageable);
}
