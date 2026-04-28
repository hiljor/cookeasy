package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

/* FriendRequestStatus represents the current state of a friend or group invitation */
type FriendRequestStatus string

const (
	StatusPending  FriendRequestStatus = "pending"
	StatusAccepted FriendRequestStatus = "accepted"
	StatusRejected FriendRequestStatus = "rejected"
)

/* FriendRequest represents an invitation from one user to another to establish a friendship */
type FriendRequest struct {
	ID         uuid.UUID           `gorm:"type:uuid;primaryKey" json:"id"`
	SenderID   uuid.UUID           `gorm:"type:uuid;not null;index" json:"sender_id"`
	ReceiverID uuid.UUID           `gorm:"type:uuid;not null;index" json:"receiver_id"`
	Status     FriendRequestStatus `gorm:"type:varchar(20);default:'pending'" json:"status"`
	CreatedAt  time.Time           `json:"created_at"`
	UpdatedAt  time.Time           `json:"updated_at"`

	Sender   User `gorm:"foreignKey:SenderID" json:"sender,omitempty"`
	Receiver User `gorm:"foreignKey:ReceiverID" json:"receiver,omitempty"`
}

/* Friendship represents a mutual connection between two users */
type Friendship struct {
	User1ID   uuid.UUID `gorm:"type:uuid;primaryKey" json:"user1_id"`
	User2ID   uuid.UUID `gorm:"type:uuid;primaryKey" json:"user2_id"`
	CreatedAt time.Time `json:"created_at"`

	User1 User `gorm:"foreignKey:User1ID" json:"-"`
	User2 User `gorm:"foreignKey:User2ID" json:"-"`
}

/* BeforeCreate ensures consistent ID sorting to prevent duplicate friendship records */
func (fs *Friendship) BeforeCreate(tx *gorm.DB) (err error) {
	if fs.User1ID.String() > fs.User2ID.String() {
		fs.User1ID, fs.User2ID = fs.User2ID, fs.User1ID
	}
	return
}

/* Group represents a collection of users who can share and collaborate on recipes */
type Group struct {
	ID          uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	Name        string         `gorm:"not null" json:"name"`
	Description string         `json:"description"`
	OwnerID     uuid.UUID      `gorm:"type:uuid;not null;index" json:"owner_id"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`

	Owner   User              `gorm:"foreignKey:OwnerID" json:"owner,omitempty"`
	Members []GroupMembership `gorm:"foreignKey:GroupID" json:"members,omitempty"`
}

/* GroupMembership tracks the association of a user with a group */
type GroupMembership struct {
	UserID    uuid.UUID `gorm:"type:uuid;primaryKey" json:"user_id"`
	GroupID   uuid.UUID `gorm:"type:uuid;primaryKey" json:"group_id"`
	JoinedAt  time.Time `json:"joined_at"`

	User  User  `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Group Group `gorm:"foreignKey:GroupID" json:"group,omitempty"`
}

/* GroupInvite represents a pending invitation for a user to join a group */
type GroupInvite struct {
	ID        uuid.UUID           `gorm:"type:uuid;primaryKey" json:"id"`
	GroupID   uuid.UUID           `gorm:"type:uuid;not null;index" json:"group_id"`
	SenderID  uuid.UUID           `gorm:"type:uuid;not null;index" json:"sender_id"`
	ReceiverID uuid.UUID          `gorm:"type:uuid;not null;index" json:"receiver_id"`
	Status    FriendRequestStatus `gorm:"type:varchar(20);default:'pending'" json:"status"`
	CreatedAt time.Time           `json:"created_at"`

	Group    Group `gorm:"foreignKey:GroupID" json:"group,omitempty"`
	Sender   User  `gorm:"foreignKey:SenderID" json:"sender,omitempty"`
	Receiver User  `gorm:"foreignKey:ReceiverID" json:"receiver,omitempty"`
}

/* BeforeCreate ensures a new FriendRequest has a UUID */
func (fr *FriendRequest) BeforeCreate(tx *gorm.DB) (err error) {
	if fr.ID == uuid.Nil {
		fr.ID = uuid.New()
	}
	return
}

/* BeforeCreate ensures a new Group has a UUID */
func (g *Group) BeforeCreate(tx *gorm.DB) (err error) {
	if g.ID == uuid.Nil {
		g.ID = uuid.New()
	}
	return
}

/* BeforeCreate ensures a new GroupInvite has a UUID */
func (gi *GroupInvite) BeforeCreate(tx *gorm.DB) (err error) {
	if gi.ID == uuid.Nil {
		gi.ID = uuid.New()
	}
	return
}
