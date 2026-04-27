package router

import (
	"cookeasy/backend/internal/handlers"
	"cookeasy/backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	r.Use(middleware.CORS())

	// Auth routes
	auth := r.Group("/api/auth")
	{
		auth.POST("/register", handlers.Register)
		auth.GET("/verify", handlers.VerifyEmail)
		auth.POST("/login", handlers.Login)
		auth.POST("/refresh", handlers.Refresh)
		auth.POST("/forgot-password", handlers.ForgotPassword)
		auth.POST("/reset-password", handlers.ResetPassword)

		// Protected routes
		protected := auth.Group("")
		protected.Use(middleware.AuthRequired())
		{
			protected.GET("/me", handlers.GetMe)
			protected.POST("/logout", handlers.Logout)
		}
	}

	return r
}
