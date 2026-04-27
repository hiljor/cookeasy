package main

import (
	"cookeasy/backend/internal/database"
	"cookeasy/backend/internal/router"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables from the root .env
	err := godotenv.Load("../../.env")
	if err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// Connect to Database
	database.Connect()

	r := router.SetupRouter()

	// Health check endpoint (moved or kept here)
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "up",
		})
	})

	// Start server
	r.Run(":8080")
}
