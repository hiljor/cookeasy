package handlers

import (
	"cookeasy/backend/internal/database"
	"cookeasy/backend/internal/models"
	"cookeasy/backend/internal/utils"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
)

/* LoginRequest defines the input for user authentication */
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

/* Login authenticates a user and sets access and refresh token cookies */
func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := database.DB.Preload("Settings").Where("email = ?", req.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	if !utils.CheckPasswordHash(req.Password, user.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	if !user.IsVerified {
		c.JSON(http.StatusForbidden, gin.H{"error": "Please verify your email first"})
		return
	}

	accessToken, err := utils.GenerateAccessToken(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate access token"})
		return
	}

	refreshTokenString := utils.GenerateRefreshToken()
	refreshToken := models.RefreshToken{
		UserID:    user.ID,
		Token:     refreshTokenString,
		ExpiresAt: time.Now().Add(7 * 24 * time.Hour),
	}

	if err := database.DB.Create(&refreshToken).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to store refresh token"})
		return
	}

	setTokenCookies(c, accessToken, refreshTokenString)

	c.JSON(http.StatusOK, gin.H{
		"message": "Logged in successfully",
		"user":    user,
	})
}

/* Logout invalidates the refresh token and clears authentication cookies */
func Logout(c *gin.Context) {
	tokenString, err := c.Cookie("refresh_token")
	if err == nil {
		database.DB.Where("token = ?", tokenString).Delete(&models.RefreshToken{})
	}

	c.SetCookie("access_token", "", -1, "/", "", false, true)
	c.SetCookie("refresh_token", "", -1, "/", "", false, true)

	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

/* Refresh rotates the refresh token and issues a new access token */
func Refresh(c *gin.Context) {
	refreshTokenString, err := c.Cookie("refresh_token")
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "No refresh token provided"})
		return
	}

	var storedToken models.RefreshToken
	if err := database.DB.Where("token = ?", refreshTokenString).First(&storedToken).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid refresh token"})
		return
	}

	if time.Now().After(storedToken.ExpiresAt) {
		database.DB.Delete(&storedToken)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Refresh token expired"})
		return
	}

	newAccessToken, err := utils.GenerateAccessToken(storedToken.UserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate access token"})
		return
	}

	newRefreshTokenString := utils.GenerateRefreshToken()

	storedToken.Token = newRefreshTokenString
	storedToken.ExpiresAt = time.Now().Add(7 * 24 * time.Hour)
	database.DB.Save(&storedToken)

	setTokenCookies(c, newAccessToken, newRefreshTokenString)

	c.JSON(http.StatusOK, gin.H{"message": "Token refreshed successfully"})
}

func setTokenCookies(c *gin.Context, access, refresh string) {
	secure := os.Getenv("APP_ENV") == "production"

	c.SetCookie("access_token", access, 900, "/", "", secure, true)
	c.SetCookie("refresh_token", refresh, 604800, "/", "", secure, true)
}
