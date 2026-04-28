package handlers

import (
	"cookeasy/backend/internal/database"
	"cookeasy/backend/internal/models"
	"cookeasy/backend/internal/utils"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

/* RegisterRequest defines the input for user registration */
type RegisterRequest struct {
	Username string `json:"username" binding:"required,min=3,max=20,alphanum"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}

/* Register creates a new user account and sends a verification email */
func Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var existingUser models.User
	if err := database.DB.Where("username = ? OR email = ?", req.Username, req.Email).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Username or email already exists"})
		return
	}

	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	verificationToken := uuid.New().String()

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

/* VerifyEmail validates a user's email using a verification token */
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

	user.IsVerified = true
	user.VerificationToken = ""
	database.DB.Save(&user)

	c.JSON(http.StatusOK, gin.H{"message": "Email verified successfully"})
}
