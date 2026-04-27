package utils

import (
	"fmt"
	"os"

	"github.com/resend/resend-go/v2"
)

func SendVerificationEmail(to, username, token string) error {
	apiKey := os.Getenv("RESEND_API_KEY")
	client := resend.NewClient(apiKey)

	// In a real app, this would be your frontend URL
	verificationLink := fmt.Sprintf("%s/verify?token=%s", os.Getenv("FRONTEND_URL"), token)

	params := &resend.SendEmailRequest{
		From:    "Cookeasy <onboarding@resend.dev>", // Resend default for testing
		To:      []string{to},
		Subject: "Verify your Cookeasy account",
		Html:    fmt.Sprintf("<h1>Welcome, %s!</h1><p>Please verify your account by clicking <a href='%s'>here</a>.</p>", username, verificationLink),
	}

	_, err := client.Emails.Send(params)
	return err
}
