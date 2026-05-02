package handlers

import (
	"cookeasy/backend/internal/database"
	"cookeasy/backend/internal/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

/* UpdateUserSettings updates the authenticated user's settings */
func UpdateUserSettings(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var settings models.UserSettings
	if err := database.DB.Where("user_id = ?", userID).First(&settings).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Settings not found"})
		return
	}

	var input struct {
		Theme *string `json:"theme"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.Theme != nil {
		settings.Theme = *input.Theme
	}

	if err := database.DB.Save(&settings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update settings"})
		return
	}

	c.JSON(http.StatusOK, settings)
}

/* SearchUsers finds users by partial username match, excluding the current user */
func SearchUsers(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusOK, []models.User{})
		return
	}

	currentUserID, _ := c.Get("user_id")

	var users []models.User
	// Use ILIKE for Postgres case-insensitive search, or LOWER() for SQLite compatibility
	// Selecting only public fields for security
	if err := database.DB.Select("id, username, bio, profile_picture_url").
		Where("username LIKE ? AND id != ?", "%"+query+"%", currentUserID).
		Limit(10).
		Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to search users"})
		return
	}

	c.JSON(http.StatusOK, users)
}

/* GetUserByUsername retrieves a user profile by their unique username, respecting privacy settings */
func GetUserByUsername(c *gin.Context) {
	username := c.Param("username")

	var user models.User
	if err := database.DB.Select("id, username, bio, profile_picture_url, is_private, created_at").
		Where("username = ?", username).
		First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user_not_found"})
		return
	}

	// Determine if the full profile should be shown
	showFullProfile := !user.IsPrivate

	// Check if requester is authorized to see private content
	if user.IsPrivate {
		if authID, exists := c.Get("user_id"); exists {
			currentUserID := authID.(uuid.UUID)
			if currentUserID == user.ID || CheckFriendship(currentUserID, user.ID) {
				showFullProfile = true
			}
		}
	}

	if showFullProfile {
		c.JSON(http.StatusOK, user)
	} else {
		// Redacted response for private profiles
		c.JSON(http.StatusOK, gin.H{
			"id":                  user.ID,
			"username":            user.Username,
			"profile_picture_url": user.ProfilePictureURL,
			"is_private":          true,
		})
	}
}

/* CheckFriendship returns true if two users are confirmed friends */
func CheckFriendship(user1ID, user2ID uuid.UUID) bool {
	id1, id2 := user1ID, user2ID
	if id1.String() > id2.String() {
		id1, id2 = id2, id1
	}

	var friendship models.Friendship
	err := database.DB.Where("user1_id = ? AND user2_id = ?", id1, id2).First(&friendship).Error
	return err == nil
}
