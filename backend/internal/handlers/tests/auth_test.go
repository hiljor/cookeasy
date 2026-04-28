package tests

import (
	"bytes"
	"cookeasy/backend/internal/database"
	"cookeasy/backend/internal/handlers"
	"cookeasy/backend/internal/models"
	"cookeasy/backend/internal/router"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupTestRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	// Use in-memory SQLite for tests
	db, _ := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	db.AutoMigrate(&models.User{}, &models.RefreshToken{}, &models.UserSettings{})
	database.DB = db

	return router.SetupRouter()
}

func TestRegister(t *testing.T) {
	r := setupTestRouter()
	os.Setenv("RESEND_API_KEY", "test_key") // Mock env

	payload := map[string]string{
		"username": "testuser",
		"email":    "test@example.com",
		"password": "password123",
	}
	body, _ := json.Marshal(payload)

	req, _ := http.NewRequest("POST", "/api/auth/register", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)
}
