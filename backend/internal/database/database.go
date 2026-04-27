package database

import (
	"cookeasy/backend/internal/models"
	"fmt"
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		// Fallback to local dev if no env var is set
		dsn = "host=localhost user=user password=password dbname=cookeasy port=5432 sslmode=disable"
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	fmt.Println("Database connection established")

	// Run migrations
	err = db.AutoMigrate(
		&models.User{},
		&models.RefreshToken{},
		&models.UserSettings{},
		&models.FriendRequest{},
		&models.Friendship{},
		&models.Group{},
		&models.GroupMembership{},
		&models.GroupInvite{},
	)
	if err != nil {
		log.Fatal("Failed to run migrations:", err)
	}
	fmt.Println("Database migration completed")

	DB = db
}
