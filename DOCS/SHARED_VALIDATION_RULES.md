# Shared Validation Rules

To keep the frontend (Zod) and backend (Go Validator) consistent, we will use the following rules for common fields:

## User
- **Username**: 3-20 characters, alphanumeric + underscores only.
- **Email**: Valid email format (regex-based).
- **Password**: Minimum 8 characters, must contain at least one number and one special character.
- **Bio**: Maximum 500 characters.

## Recipe
- **Title**: 3-100 characters.
- **Description**: Maximum 2000 characters.
- **Ingredients**: Minimum 1 ingredient.
- **Instructions**: Minimum 1 step.
- **Image**: Must be one of: jpg, jpeg, png, webp. Max 5MB.
