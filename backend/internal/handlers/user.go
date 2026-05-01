package handlers

import (
	"cookeasy/backend/internal/database"
	"cookeasy/backend/internal/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

/* UpdateUserSettings updates the authenticated user's settings */
func UpdateUserSettings(c *gin.Context) {
	userID, _ := c.Get("userID")

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
