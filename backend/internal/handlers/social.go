package handlers

import (
	"cookeasy/backend/internal/database"
	"cookeasy/backend/internal/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

/* CreateGroup creates a new social group */
func CreateGroup(c *gin.Context) {
	currentUserID := c.MustGet("user_id").(uuid.UUID)

	var req struct {
		Name        string `json:"name" binding:"required"`
		Description string `json:"description"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	group := models.Group{
		Name:        req.Name,
		Description: req.Description,
		OwnerID:     currentUserID,
	}

	if err := database.DB.Create(&group).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create group"})
		return
	}

	// Automatically add the creator as a member
	membership := models.GroupMembership{
		UserID:  currentUserID,
		GroupID: group.ID,
	}
	database.DB.Create(&membership)

	c.JSON(http.StatusCreated, group)
}

/* GetGroups retrieves all groups the current user is a member of */
func GetGroups(c *gin.Context) {
	currentUserID := c.MustGet("user_id").(uuid.UUID)

	var memberships []models.GroupMembership
	if err := database.DB.Where("user_id = ?", currentUserID).Find(&memberships).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch groups"})
		return
	}

	var groupIDs []uuid.UUID
	for _, m := range memberships {
		groupIDs = append(groupIDs, m.GroupID)
	}

	var groups []models.Group
	if len(groupIDs) > 0 {
		database.DB.Find(&groups, groupIDs)
	} else {
		groups = []models.Group{}
	}

	c.JSON(http.StatusOK, groups)
}

/* GetGroup retrieves details for a specific group */
func GetGroup(c *gin.Context) {
	groupID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid group ID"})
		return
	}

	var group models.Group
	if err := database.DB.Preload("Members.User").First(&group, groupID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Group not found"})
		return
	}

	c.JSON(http.StatusOK, group)
}

/* DeleteGroup removes a group if the current user is the owner */
func DeleteGroup(c *gin.Context) {
	currentUserID := c.MustGet("user_id").(uuid.UUID)
	groupID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid group ID"})
		return
	}

	var group models.Group
	if err := database.DB.Where("id = ? AND owner_id = ?", groupID, currentUserID).First(&group).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only the owner can delete this group"})
		return
	}

	database.DB.Delete(&group)
	c.JSON(http.StatusOK, gin.H{"message": "Group deleted successfully"})
}

/* FriendRequestAction defines the input for responding to a friend request */
type FriendRequestAction struct {
	RequestID uuid.UUID                  `json:"request_id" binding:"required"`
	Action    models.FriendRequestStatus `json:"action" binding:"required,oneof=accepted rejected"`
}

/* SendFriendRequest creates a new pending friend request between users */
func SendFriendRequest(c *gin.Context) {
	currentUserID := c.MustGet("user_id").(uuid.UUID)
	
	var req struct {
		ReceiverID uuid.UUID `json:"receiver_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if currentUserID == req.ReceiverID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "You cannot friend yourself"})
		return
	}
// Check if request already exists
var existing models.FriendRequest
if err := database.DB.Where("(sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)", 
	currentUserID, req.ReceiverID, req.ReceiverID, currentUserID).First(&existing).Error; err == nil {
	c.JSON(http.StatusConflict, gin.H{"error": "A friend request already exists between these users"})
	return
}

// Check if already friends
id1, id2 := currentUserID, req.ReceiverID
if id1.String() > id2.String() {
	id1, id2 = id2, id1
}
var friendship models.Friendship
if err := database.DB.Where("user1_id = ? AND user2_id = ?", id1, id2).First(&friendship).Error; err == nil {
	c.JSON(http.StatusConflict, gin.H{"error": "You are already friends with this user"})
	return
}

friendReq := models.FriendRequest{

		SenderID:   currentUserID,
		ReceiverID: req.ReceiverID,
		Status:     models.StatusPending,
	}

	if err := database.DB.Create(&friendReq).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send friend request"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Friend request sent"})
}

/* RespondFriendRequest handles accepting or rejecting a pending friend request */
func RespondFriendRequest(c *gin.Context) {
	currentUserID := c.MustGet("user_id").(uuid.UUID)
	
	var req FriendRequestAction
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var friendReq models.FriendRequest
	if err := database.DB.Where("id = ? AND receiver_id = ?", req.RequestID, currentUserID).First(&friendReq).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Friend request not found"})
		return
	}

	if friendReq.Status != models.StatusPending {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Request already processed"})
		return
	}

	if req.Action == models.StatusAccepted {
		friendship := models.Friendship{
			User1ID: friendReq.SenderID,
			User2ID: friendReq.ReceiverID,
		}

		err := database.DB.Transaction(func(tx *gorm.DB) error {
			if err := tx.Create(&friendship).Error; err != nil {
				return err
			}
			return tx.Model(&friendReq).Update("status", models.StatusAccepted).Error
		})

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to accept friend request"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Friend request accepted"})
	} else {
		database.DB.Model(&friendReq).Update("status", models.StatusRejected)
		c.JSON(http.StatusOK, gin.H{"message": "Friend request rejected"})
	}
}

/* GetFriends retrieves a list of all users the current user is friends with */
func GetFriends(c *gin.Context) {
	currentUserID := c.MustGet("user_id").(uuid.UUID)

	var friendships []models.Friendship
	if err := database.DB.Where("user1_id = ? OR user2_id = ?", currentUserID, currentUserID).Find(&friendships).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch friends"})
		return
	}

	var friendIDs []uuid.UUID
	for _, f := range friendships {
		if f.User1ID == currentUserID {
			friendIDs = append(friendIDs, f.User2ID)
		} else {
			friendIDs = append(friendIDs, f.User1ID)
		}
	}

	var friends []models.User
	if len(friendIDs) > 0 {
		database.DB.Where("id IN ?", friendIDs).Find(&friends)
	} else {
		friends = []models.User{}
	}

	c.JSON(http.StatusOK, friends)
}

/* GetFriendRequests retrieves all pending friend requests for the current user */
func GetFriendRequests(c *gin.Context) {
	currentUserID := c.MustGet("user_id").(uuid.UUID)

	var requests []models.FriendRequest
	if err := database.DB.Preload("Sender").Where("receiver_id = ? AND status = ?", currentUserID, models.StatusPending).Find(&requests).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch friend requests"})
		return
	}

	c.JSON(http.StatusOK, requests)
}

/* RemoveFriend deletes an existing friendship between users */
func RemoveFriend(c *gin.Context) {
	currentUserID := c.MustGet("user_id").(uuid.UUID)
	friendID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid friend ID"})
		return
	}

	// Friendship table uses (smaller_id, larger_id) logic
	id1, id2 := currentUserID, friendID
	if id1.String() > id2.String() {
		id1, id2 = id2, id1
	}

	if err := database.DB.Where("user1_id = ? AND user2_id = ?", id1, id2).Delete(&models.Friendship{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove friend"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Friend removed successfully"})
}
