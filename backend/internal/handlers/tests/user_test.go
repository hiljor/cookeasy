package tests

import (
	"bytes"
	"cookeasy/backend/internal/database"
	"cookeasy/backend/internal/models"
	"cookeasy/backend/internal/utils"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestGetMe_Success(t *testing.T) {
	r := setupTestRouter()

	user := models.User{
		Username: "testuser",
		Email:    "test@example.com",
		Settings: models.UserSettings{Theme: "midnight"},
	}
	database.DB.Create(&user)

	token, _ := utils.GenerateAccessToken(user.ID)

	req, _ := http.NewRequest("GET", "/api/auth/me", nil)
	req.AddCookie(&http.Cookie{Name: "access_token", Value: token})
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.Equal(t, "testuser", response["username"])

	settings := response["settings"].(map[string]interface{})
	assert.Equal(t, "midnight", settings["theme"])
}

func TestUpdateMe_Success(t *testing.T) {
	r := setupTestRouter()

	user := models.User{
		Username: "oldname",
		Email:    "test@example.com",
	}
	database.DB.Create(&user)

	token, _ := utils.GenerateAccessToken(user.ID)

	payload := map[string]string{
		"username": "newname",
		"bio":      "I love cooking!",
	}
	body, _ := json.Marshal(payload)

	req, _ := http.NewRequest("PUT", "/api/auth/me", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	req.AddCookie(&http.Cookie{Name: "access_token", Value: token})
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var updatedUser models.User
	database.DB.First(&updatedUser, user.ID)
	assert.Equal(t, "newname", updatedUser.Username)
	assert.Equal(t, "I love cooking!", *updatedUser.Bio)
}

func TestUpdateUserSettings_Success(t *testing.T) {
	r := setupTestRouter()

	user := models.User{
		Username: "themeuser",
		Email:    "theme@example.com",
		Settings: models.UserSettings{Theme: "default"},
	}
	database.DB.Create(&user)

	token, _ := utils.GenerateAccessToken(user.ID)

	payload := map[string]string{
		"theme": "sakura",
	}
	body, _ := json.Marshal(payload)

	req, _ := http.NewRequest("PATCH", "/api/auth/me/settings", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	req.AddCookie(&http.Cookie{Name: "access_token", Value: token})
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var settings models.UserSettings
	database.DB.Where("user_id = ?", user.ID).First(&settings)
	assert.Equal(t, "sakura", settings.Theme)
}

func TestUpdateUserSettings_Unauthorized(t *testing.T) {
	r := setupTestRouter()

	payload := map[string]string{
		"theme": "midnight",
	}
	body, _ := json.Marshal(payload)

	req, _ := http.NewRequest("PATCH", "/api/auth/me/settings", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestSearchUsers_Success(t *testing.T) {
	r := setupTestRouter()

	currentUserID, _ := uuid.Parse("550e8400-e29b-41d4-a716-446655440001")
	r1 := "r1"
	r2 := "r2"
	r3 := "r3"
	user1 := models.User{ID: currentUserID, Username: "searcher", Email: "searcher@ex.com", VerificationToken: "v1", ResetToken: &r1}
	user2 := models.User{Username: "chef_mario", Email: "mario@ex.com", VerificationToken: "v2", ResetToken: &r2}
	user3 := models.User{Username: "chef_luigi", Email: "luigi@ex.com", VerificationToken: "v3", ResetToken: &r3}
	database.DB.Create(&user1)
	database.DB.Create(&user2)
	database.DB.Create(&user3)

	token, _ := utils.GenerateAccessToken(user1.ID)

	req, _ := http.NewRequest("GET", "/api/users/search?q=chef", nil)
	req.AddCookie(&http.Cookie{Name: "access_token", Value: token})
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var results []map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &results)

	assert.Len(t, results, 2) // mario and luigi
	assert.Equal(t, "chef_mario", results[0]["username"])
	// Verify email is not loaded (should be zero value in JSON)
	assert.Equal(t, "", results[0]["email"])
}

func TestGetUserByUsername_Success(t *testing.T) {
	r := setupTestRouter()

	bio := "I have a bio"
	user := models.User{
		Username: "chef_special",
		Email:    "special@example.com",
		Bio:      &bio,
	}
	database.DB.Create(&user)

	// We need to be authenticated to access /api/users
	token, _ := utils.GenerateAccessToken(uuid.New())

	req, _ := http.NewRequest("GET", "/api/users/chef_special", nil)
	req.AddCookie(&http.Cookie{Name: "access_token", Value: token})
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.Equal(t, "chef_special", response["username"])
	assert.Equal(t, "I have a bio", response["bio"])
	// Email should be empty string (zero value for unselected string field)
	assert.Equal(t, "", response["email"])
}

func TestGetUserByUsername_NotFound(t *testing.T) {
	r := setupTestRouter()
	token, _ := utils.GenerateAccessToken(uuid.New())

	req, _ := http.NewRequest("GET", "/api/users/nonexistent", nil)
	req.AddCookie(&http.Cookie{Name: "access_token", Value: token})
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusNotFound, w.Code)
}
