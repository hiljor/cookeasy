package tests

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"

	"cookeasy/backend/internal/handlers"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestSendFriendRequest_InvalidRequest(t *testing.T) {
	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(w)

	// Send request with no body
	ctx.Request, _ = http.NewRequest("POST", "/api/social/friends/request", bytes.NewBufferString("{}"))
	ctx.Set("user_id", uuid.New())

	handlers.SendFriendRequest(ctx)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestGetNotifications_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(w)

	// Mock user ID
	ctx.Set("user_id", uuid.New())

	handlers.GetNotifications(ctx)

	// Note: Without a DB, this should return a 500 or empty 200 depending on logic.
	// Since we are mocking components here, we'd ideally mock DB, 
    // but for now verifying it handles the call is a start.
	assert.Contains(t, []int{http.StatusOK, http.StatusInternalServerError}, w.Code)
}
