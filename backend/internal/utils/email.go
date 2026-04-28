package utils

import (
	"fmt"
	"os"

	"github.com/resend/resend-go/v2"
)

/* SendVerificationEmail sends a registration confirmation email using the Resend API */
func SendVerificationEmail(to, username, token string) error {
	apiKey := os.Getenv("RESEND_API_KEY")
	client := resend.NewClient(apiKey)

	verificationLink := fmt.Sprintf("%s/verify?token=%s", os.Getenv("FRONTEND_URL"), token)

	params := &resend.SendEmailRequest{
		From:    "Cookeasy <onboarding@resend.dev>",
		To:      []string{to},
		Subject: "Verify your Cookeasy account",
		Html:    fmt.Sprintf("<h1>Welcome, %s!</h1><p>Please verify your account by clicking <a href='%s'>here</a>.</p>", username, verificationLink),
	}

	_, err := client.Emails.Send(params)
	return err
}

/* SendPasswordResetEmail sends an email with a unique token for account recovery */
func SendPasswordResetEmail(to, username, token string) error {
	apiKey := os.Getenv("RESEND_API_KEY")
	client := resend.NewClient(apiKey)

	resetLink := fmt.Sprintf("%s/reset-password?token=%s", os.Getenv("FRONTEND_URL"), token)

	params := &resend.SendEmailRequest{
		From:    "Cookeasy <onboarding@resend.dev>",
		To:      []string{to},
		Subject: "Reset your Cookeasy password",
		Html:    fmt.Sprintf("<h1>Hello, %s</h1><p>You requested a password reset. Click <a href='%s'>here</a> to set a new password. This link expires in 1 hour.</p>", username, resetLink),
	}

	_, err := client.Emails.Send(params)
	return err
}
