package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type FriendRequestStatus string

const (
	StatusPending  FriendRequestStatus = "pending"
	StatusAccepted FriendRequestStatus = "accepted"
	StatusRejected FriendRequestStatus = "rejected"
)

type FriendRequest struct {
	ID         uuid.UUID           `gorm:"type:uuid;primaryKey" json:"id"`
	SenderID   uuid.UUID           `gorm:"type:uuid;not null;index" json:"sender_id"`
	ReceiverID uuid.UUID           `gorm:"type:uuid;not null;index" json:"receiver_id"`
	Status     FriendRequestStatus `gorm:"type:varchar(20);default:'pending'" json:"status"`
	CreatedAt  time.Time           `json:"created_at"`
	UpdatedAt  time.Time           `json:"updated_at"`

	// Relations
	Sender   User `gorm:"foreignKey:SenderID" json:"sender,omitempty"`
	Receiver User `gorm:"foreignKey:ReceiverID" json:"receiver,omitempty"`
}

type Friendship struct {
	User1ID   uuid.UUID `gorm:"type:uuid;primaryKey" json:"user1_id"`
	User2ID   uuid.UUID `gorm:"type:uuid;primaryKey" json:"user2_id"`
	CreatedAt time.Time `json:"created_at"`

	// Relations
	User1 User `gorm:"foreignKey:User1ID" json:"-"`
	User2 User `gorm:"foreignKey:User2ID" json:"-"`
}

func (fs *Friendship) BeforeCreate(tx *gorm.DB) (err error) {
	// Sort IDs so that User1ID is always the "smaller" UUID
	// This prevents duplicate friendships (A,B) and (B,A)
	if fs.User1ID.String() > fs.User2ID.String() {
		fs.User1ID, fs.User2ID = fs.User2ID, fs.User1ID
	}
	return
}

type Group struct {
	ID          uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	Name        string         `gorm:"not null" json:"name"`
	Description string         `json:"description"`
	OwnerID     uuid.UUID      `gorm:"type:uuid;not null;index" json:"owner_id"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`

	// Relations
	Owner   User              `gorm:"foreignKey:OwnerID" json:"owner,omitempty"`
	Members []GroupMembership `gorm:"foreignKey:GroupID" json:"members,omitempty"`
}

type GroupMembership struct {
	UserID    uuid.UUID `gorm:"type:uuid;primaryKey" json:"user_id"`
	GroupID   uuid.UUID `gorm:"type:uuid;primaryKey" json:"group_id"`
	JoinedAt  time.Time `json:"joined_at"`

	// Relations
	User  User  `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Group Group `gorm:"foreignKey:GroupID" json:"group,omitempty"`
}

type GroupInvite struct {
	ID        uuid.UUID           `gorm:"type:uuid;primaryKey" json:"id"`
	GroupID   uuid.UUID           `gorm:"type:uuid;not null;index" json:"group_id"`
	SenderID  uuid.UUID           `gorm:"type:uuid;not null;index" json:"sender_id"`
	ReceiverID uuid.UUID          `gorm:"type:uuid;not null;index" json:"receiver_id"`
	Status    FriendRequestStatus `gorm:"type:varchar(20);default:'pending'" json:"status"`
	CreatedAt time.Time           `json:"created_at"`

	// Relations
	Group    Group `gorm:"foreignKey:GroupID" json:"group,omitempty"`
	Sender   User  `gorm:"foreignKey:SenderID" json:"sender,omitempty"`
	Receiver User  `gorm:"foreignKey:ReceiverID" json:"receiver,omitempty"`
}

func (fr *FriendRequest) BeforeCreate(tx *gorm.DB) (err error) {
	if fr.ID == uuid.Nil {
		fr.ID = uuid.New()
	}
	return
}

func (g *Group) BeforeCreate(tx *gorm.DB) (err error) {
	if g.ID == uuid.Nil {
		g.ID = uuid.New()
	}
	return
}

func (gi *GroupInvite) BeforeCreate(tx *gorm.DB) (err error) {
	if gi.ID == uuid.Nil {
		gi.ID = uuid.New()
	}
	return
}
