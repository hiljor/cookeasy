package handlers

import (
	"cookeasy/backend/internal/database"
	"cookeasy/backend/internal/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

/* CreateRecipe handles the creation of a new recipe with its ingredients and tags */
func CreateRecipe(c *gin.Context) {
	currentUserID := c.MustGet("user_id").(uuid.UUID)

	var req struct {
		Title        string   `json:"title" binding:"required"`
		Description  string   `json:"description"`
		Instructions []string `json:"instructions" binding:"required,min=1"`
		PrepTime     int      `json:"prep_time"`
		CookTime     int      `json:"cook_time"`
		Servings     int      `json:"servings"`
		IsPrivate    bool     `json:"is_private"`
		Ingredients  []struct {
			Name     string  `json:"name" binding:"required"`
			Quantity float64 `json:"quantity"`
			Unit     string  `json:"unit"`
		} `json:"ingredients"`
		Tags []string `json:"tags"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Create Recipe
	recipe := models.Recipe{
		UserID:       currentUserID,
		Title:        req.Title,
		Description:  req.Description,
		Instructions: req.Instructions,
		PrepTime:     req.PrepTime,
		CookTime:     req.CookTime,
		Servings:     req.Servings,
		IsPrivate:    req.IsPrivate,
	}

	// Persist ingredients
	for _, ing := range req.Ingredients {
		recipe.Ingredients = append(recipe.Ingredients, models.Ingredient{
			Name:     ing.Name,
			Quantity: ing.Quantity,
			Unit:     ing.Unit,
		})
	}

	// Persist tags
	for _, tagName := range req.Tags {
		var tag models.Tag
		if err := database.DB.Where(models.Tag{Name: tagName}).FirstOrCreate(&tag).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process tags"})
			return
		}
		recipe.Tags = append(recipe.Tags, tag)
	}

	if err := database.DB.Create(&recipe).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create recipe"})
		return
	}

	c.JSON(http.StatusCreated, recipe)
}
