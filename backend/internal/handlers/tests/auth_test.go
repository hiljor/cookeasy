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

func TestRegister_Success(t *testing.T) {
	r := setupTestRouter()
	os.Setenv("RESEND_API_KEY", "test_key")

	payload := map[string]string{
		"username": "newuser",
		"email":    "new@example.com",
		"password": "password123",
	}
	body, _ := json.Marshal(payload)

	req, _ := http.NewRequest("POST", "/api/auth/register", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)
}

func TestRegister_Conflict(t *testing.T) {
	r := setupTestRouter()
	
	user := models.User{Username: "existing", Email: "exist@ex.com", Password: "password"}
	database.DB.Create(&user)

	payload := map[string]string{
		"username": "existing",
		"email":    "new@ex.com",
		"password": "password123",
	}
	body, _ := json.Marshal(payload)

	req, _ := http.NewRequest("POST", "/api/auth/register", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusConflict, w.Code)
}

func TestLogin_Success(t *testing.T) {
	r := setupTestRouter()
	
	hashedPassword, _ := models.HashPassword("password123")
	user := models.User{
		Username:   "loginuser",
		Email:      "login@ex.com",
		Password:   hashedPassword,
		IsVerified: true,
	}
	database.DB.Create(&user)

	payload := map[string]string{
		"email":    "login@ex.com",
		"password": "password123",
	}
	body, _ := json.Marshal(payload)

	req, _ := http.NewRequest("POST", "/api/auth/login", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	// Check if cookies are set
	cookies := w.Result().Cookies()
	assert.NotEmpty(t, cookies)
}
