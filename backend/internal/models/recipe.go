package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

/* Recipe represents a cooking instruction set created by a user */
type Recipe struct {
	ID            uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	UserID        uuid.UUID      `gorm:"type:uuid;not null" json:"user_id"`
	User          User           `gorm:"foreignKey:UserID" json:"user"`
	Title         string         `gorm:"not null" json:"title"`
	Description  string         `json:"description"`
	Instructions []string       `gorm:"type:jsonb;not null" json:"instructions"`
	ImageURL     *string        `json:"image_url"`
	PrepTime      int            `json:"prep_time"` // in minutes
	CookTime      int            `json:"cook_time"` // in minutes
	Servings      int            `json:"servings"`
	IsPrivate     bool           `gorm:"default:false" json:"is_private"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
	Ingredients   []Ingredient   `json:"ingredients"`
	Tags          []Tag          `gorm:"many2many:recipe_tags;" json:"tags"`
}

/* Ingredient represents a component of a recipe */
type Ingredient struct {
	ID        uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	RecipeID  uuid.UUID      `gorm:"type:uuid;not null" json:"recipe_id"`
	Name      string         `gorm:"not null" json:"name"`
	Quantity  float64        `json:"quantity"`
	Unit      string         `json:"unit"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

/* Tag allows recipes to be categorized */
type Tag struct {
	ID        uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	Name      string         `gorm:"uniqueIndex;not null" json:"name"`
	CreatedAt time.Time      `json:"created_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

/* BeforeCreate ensures models have UUIDs */
func (r *Recipe) BeforeCreate(tx *gorm.DB) (err error) {
	if r.ID == uuid.Nil {
		r.ID = uuid.New()
	}
	return
}

func (i *Ingredient) BeforeCreate(tx *gorm.DB) (err error) {
	if i.ID == uuid.Nil {
		i.ID = uuid.New()
	}
	return
}

func (t *Tag) BeforeCreate(tx *gorm.DB) (err error) {
	if t.ID == uuid.Nil {
		t.ID = uuid.New()
	}
	return
}
