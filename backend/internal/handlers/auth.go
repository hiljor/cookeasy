package handlers

import (
	"cookeasy/backend/internal/database"
	"cookeasy/backend/internal/models"
	"cookeasy/backend/internal/utils"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type RegisterRequest struct {
	Username string `json:"username" binding:"required,min=3,max=20,alphanum"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}

func Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if user already exists
	var existingUser models.User
	if err := database.DB.Where("username = ? OR email = ?", req.Username, req.Email).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Username or email already exists"})
		return
	}

	// Hash password
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Generate verification token
	verificationToken := uuid.New().String()

	// Create user
	user := models.User{
		Username:          req.Username,
		Email:             req.Email,
		Password:          hashedPassword,
		VerificationToken: verificationToken,
		Settings: models.UserSettings{
			NotifyFriendRequest:   true,
			NotifyRequestAccepted: true,
			NotifyRecipeMade:      true,
			NotifyAddedToCookbook: true,
			Theme:                 "light",
		},
	}

	if err := database.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	// Send verification email
	go func() {
		err := utils.SendVerificationEmail(user.Email, user.Username, verificationToken)
		if err != nil {
			log.Printf("Failed to send verification email to %s: %v", user.Email, err)
		}
	}()

	c.JSON(http.StatusCreated, gin.H{
		"message": "User registered successfully. Please verify your email.",
		"user":    user,
	})
}

func VerifyEmail(c *gin.Context) {
	token := c.Query("token")
	if token == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Verification token is required"})
		return
	}

	var user models.User
	if err := database.DB.Where("verification_token = ?", token).First(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or expired verification token"})
		return
	}

	// Update user status
	user.IsVerified = true
	user.VerificationToken = ""
	database.DB.Save(&user)

	c.JSON(http.StatusOK, gin.H{"message": "Email verified successfully"})
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Find user
	var user models.User
	if err := database.DB.Preload("Settings").Where("email = ?", req.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// Check password
	if !utils.CheckPasswordHash(req.Password, user.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// Check if verified
	if !user.IsVerified {
		c.JSON(http.StatusForbidden, gin.H{"error": "Please verify your email first"})
		return
	}

	// Generate tokens
	accessToken, err := utils.GenerateAccessToken(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate access token"})
		return
	}

	refreshTokenString := utils.GenerateRefreshToken()
	refreshToken := models.RefreshToken{
		UserID:    user.ID,
		Token:     refreshTokenString,
		ExpiresAt: time.Now().Add(7 * 24 * time.Hour), // 7 days
	}

	if err := database.DB.Create(&refreshToken).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to store refresh token"})
		return
	}

	// Set cookies
	setTokenCookies(c, accessToken, refreshTokenString)

	c.JSON(http.StatusOK, gin.H{
		"message": "Logged in successfully",
		"user":    user,
	})
}

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

func Logout(c *gin.Context) {
	tokenString, err := c.Cookie("refresh_token")
	if err == nil {
		// Delete token from database
		database.DB.Where("token = ?", tokenString).Delete(&models.RefreshToken{})
	}

	// Clear cookies
	c.SetCookie("access_token", "", -1, "/", "", false, true)
	c.SetCookie("refresh_token", "", -1, "/", "", false, true)

	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

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

	// Rotate token: generate new access and refresh tokens
	newAccessToken, err := utils.GenerateAccessToken(storedToken.UserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate access token"})
		return
	}

	newRefreshTokenString := utils.GenerateRefreshToken()

	// Update stored token with new string and expiry
	storedToken.Token = newRefreshTokenString
	storedToken.ExpiresAt = time.Now().Add(7 * 24 * time.Hour)
	database.DB.Save(&storedToken)

	// Set new cookies
	setTokenCookies(c, newAccessToken, newRefreshTokenString)

	c.JSON(http.StatusOK, gin.H{"message": "Token refreshed successfully"})
}

type ForgotPasswordRequest struct {
	Email string `json:"email" binding:"required,email"`
}

func ForgotPassword(c *gin.Context) {
	var req ForgotPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := database.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
		// We don't want to leak if the email exists, so we return OK anyway
		c.JSON(http.StatusOK, gin.H{"message": "If that email exists, a reset link has been sent"})
		return
	}

	// Generate reset token
	resetToken := uuid.New().String()
	expiry := time.Now().Add(1 * time.Hour)

	user.ResetToken = resetToken
	user.ResetTokenExpires = &expiry
	database.DB.Save(&user)

	// Send email
	go func() {
		err := utils.SendPasswordResetEmail(user.Email, user.Username, resetToken)
		if err != nil {
			log.Printf("Failed to send reset email to %s: %v", user.Email, err)
		}
	}()

	c.JSON(http.StatusOK, gin.H{"message": "If that email exists, a reset link has been sent"})
}

type ResetPasswordRequest struct {
	Token       string `json:"token" binding:"required"`
	NewPassword string `json:"new_password" binding:"required,min=8"`
}

func ResetPassword(c *gin.Context) {
	var req ResetPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := database.DB.Where("reset_token = ?", req.Token).First(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or expired reset token"})
		return
	}

	if user.ResetTokenExpires == nil || time.Now().After(*user.ResetTokenExpires) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Reset token has expired"})
		return
	}

	// Hash new password
	hashedPassword, err := utils.HashPassword(req.NewPassword)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Update user
	user.Password = hashedPassword
	user.ResetToken = ""
	user.ResetTokenExpires = nil
	database.DB.Save(&user)

	c.JSON(http.StatusOK, gin.H{"message": "Password reset successfully"})
}

func setTokenCookies(c *gin.Context, access, refresh string) {
	secure := os.Getenv("APP_ENV") == "production"

	// Access Token Cookie (HttpOnly)
	c.SetCookie("access_token", access, 900, "/", "", secure, true)

	// Refresh Token Cookie (HttpOnly)
	c.SetCookie("refresh_token", refresh, 604800, "/", "", secure, true)
}
