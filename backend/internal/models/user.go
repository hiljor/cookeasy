package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

/* User represents a registered member of the platform */
type User struct {
	ID                uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	Username          string         `gorm:"uniqueIndex;not null" json:"username"`
	Email             string         `gorm:"uniqueIndex;not null" json:"email"`
	Password          string         `gorm:"not null" json:"-"`
	Bio               *string        `json:"bio"`
	ProfilePictureURL *string        `json:"profile_picture_url"`
	IsPrivate         bool           `gorm:"default:false" json:"is_private"`
	IsVerified        bool           `gorm:"default:false" json:"is_verified"`
	VerificationToken string         `gorm:"uniqueIndex" json:"-"`
	ResetToken        *string        `gorm:"uniqueIndex" json:"-"`
	ResetTokenExpires *time.Time     `json:"-"`
	CreatedAt         time.Time      `json:"created_at"`
	UpdatedAt         time.Time      `json:"updated_at"`
	DeletedAt         gorm.DeletedAt `gorm:"index" json:"-"`
	Settings          UserSettings   `json:"settings"`
}

/* UserSettings stores personalization and notification preferences */
type UserSettings struct {
	ID                    uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	UserID                uuid.UUID `gorm:"type:uuid;uniqueIndex;not null" json:"user_id"`
	NotifyFriendRequest   bool      `gorm:"default:true" json:"notify_friend_request"`
	NotifyRequestAccepted bool      `gorm:"default:true" json:"notify_request_accepted"`
	NotifyRecipeMade      bool      `gorm:"default:true" json:"notify_recipe_made"`
	NotifyAddedToCookbook bool      `gorm:"default:true" json:"notify_added_to_cookbook"`
	Theme                 string    `gorm:"default:'default'" json:"theme"`
}

/* BeforeCreate ensures a new User record has a UUID */
func (u *User) BeforeCreate(tx *gorm.DB) (err error) {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return
}

/* BeforeCreate ensures a new UserSettings record has a UUID */
func (us *UserSettings) BeforeCreate(tx *gorm.DB) (err error) {
	if us.ID == uuid.Nil {
		us.ID = uuid.New()
	}
	return
}
