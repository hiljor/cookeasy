package router

import (
	"cookeasy/backend/internal/handlers"
	"cookeasy/backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

/* SetupRouter configures the Gin engine with middleware and API routes */
func SetupRouter() *gin.Engine {
	r := gin.Default()

	r.Use(middleware.CORS())

	auth := r.Group("/api/auth")
	{
		auth.POST("/register", handlers.Register)
		auth.GET("/verify", handlers.VerifyEmail)
		auth.POST("/login", handlers.Login)
		auth.POST("/refresh", handlers.Refresh)
		auth.POST("/forgot-password", handlers.ForgotPassword)
		auth.POST("/reset-password", handlers.ResetPassword)

		protected := auth.Group("")
		protected.Use(middleware.AuthRequired())
		{
			protected.GET("/me", handlers.GetMe)
			protected.PUT("/me", handlers.UpdateMe)
			protected.PUT("/me/avatar", handlers.UpdateProfilePicture)
			protected.POST("/logout", handlers.Logout)
		}
	}

	// Social routes
	social := r.Group("/api/social")
	social.Use(middleware.AuthRequired())
	{
		social.POST("/friends/request", handlers.SendFriendRequest)
		social.GET("/friends/requests", handlers.GetFriendRequests)
		social.POST("/friends/respond", handlers.RespondFriendRequest)
		social.GET("/friends", handlers.GetFriends)
		social.DELETE("/friends/:id", handlers.RemoveFriend)
	}

	return r
}
