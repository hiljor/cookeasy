package handlers

import (
	"cookeasy/backend/internal/database"
	"cookeasy/backend/internal/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

/* GetMe retrieves the currently authenticated user's profile and settings */
func GetMe(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User ID not found in context"})
		return
	}

	var user models.User
	if err := database.DB.Preload("Settings").Where("id = ?", userID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}

/* UpdateProfileRequest defines the allowed fields for profile updates */
type UpdateProfileRequest struct {
	Username string  `json:"username" binding:"omitempty,min=3,max=20,alphanum"`
	Bio      *string `json:"bio" binding:"omitempty,max=500"`
}

/* UpdateMe updates the currently authenticated user's profile information */
func UpdateMe(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var req UpdateProfileRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := database.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if req.Username != "" && req.Username != user.Username {
		var existing models.User
		if err := database.DB.Where("username = ?", req.Username).First(&existing).Error; err == nil {
			c.JSON(http.StatusConflict, gin.H{"error": "Username already taken"})
			return
		}
		user.Username = req.Username
	}

	if req.Bio != nil {
		user.Bio = req.Bio
	}

	if err := database.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Profile updated successfully",
		"user":    user,
	})
}

/* UpdateProfilePicture handles uploading and updating the user's profile image */
func UpdateProfilePicture(c *gin.Context) {
	userID, _ := c.Get("user_id")

	file, header, err := c.Request.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No image uploaded"})
		return
	}
	defer file.Close()

	// Validate file size (5MB)
	if header.Size > 5*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Image too large (max 5MB)"})
		return
	}

	// Upload to Supabase
	filePath := fmt.Sprintf("avatars/%s-%s", userID, header.Filename)
	publicURL, err := utils.UploadToSupabase("media", filePath, file, header.Header.Get("Content-Type"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upload image"})
		return
	}

	// Update user record
	if err := database.DB.Model(&models.User{}).Where("id = ?", userID).Update("profile_picture_url", publicURL).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user profile picture"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":             "Profile picture updated successfully",
		"profile_picture_url": publicURL,
	})
}
