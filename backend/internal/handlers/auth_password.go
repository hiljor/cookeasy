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

/* ForgotPasswordRequest defines the input for requesting a password reset */
type ForgotPasswordRequest struct {
	Email string `json:"email" binding:"required,email"`
}

/* ForgotPassword generates a reset token and sends a password reset email */
func ForgotPassword(c *gin.Context) {
	var req ForgotPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := database.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusOK, gin.H{"message": "If that email exists, a reset link has been sent"})
		return
	}

	resetToken := uuid.New().String()
	expiry := time.Now().Add(1 * time.Hour)

	user.ResetToken = resetToken
	user.ResetTokenExpires = &expiry
	database.DB.Save(&user)

	go func() {
		err := utils.SendPasswordResetEmail(user.Email, user.Username, resetToken)
		if err != nil {
			log.Printf("Failed to send reset email to %s: %v", user.Email, err)
		}
	}()

	c.JSON(http.StatusOK, gin.H{"message": "If that email exists, a reset link has been sent"})
}

/* ResetPasswordRequest defines the input for resetting a password */
type ResetPasswordRequest struct {
	Token       string `json:"token" binding:"required"`
	NewPassword string `json:"new_password" binding:"required,min=8"`
}

/* ResetPassword validates the reset token and updates the user's password */
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

	hashedPassword, err := utils.HashPassword(req.NewPassword)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	user.Password = hashedPassword
	user.ResetToken = ""
	user.ResetTokenExpires = nil
	database.DB.Save(&user)

	c.JSON(http.StatusOK, gin.H{"message": "Password reset successfully"})
}
