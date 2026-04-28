package handlers

import (
	"cookeasy/backend/internal/database"
	"cookeasy/backend/internal/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

/* GetProfileByUsername retrieves a user's public profile information */
func GetProfileByUsername(c *gin.Context) {
	username := c.Param("username")

	var user models.User
	// We only select public fields
	if err := database.DB.Select("id", "username", "bio", "profile_picture_url", "created_at").
		Where("username = ?", username).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}
