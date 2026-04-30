package utils

import (
	"context"
	"os"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

/* UploadToCloudinary uploads a file to Cloudinary and returns the secure URL */
func UploadToCloudinary(file interface{}, publicID string, folder string) (string, error) {
	cloudinaryURL := os.Getenv("CLOUDINARY_URL")
	cld, err := cloudinary.NewFromURL(cloudinaryURL)
	if err != nil {
		return "", err
	}

	ctx := context.Background()
	uploadResult, err := cld.Upload.Upload(ctx, file, uploader.UploadParams{
		PublicID: publicID,
		Folder:   folder,
	})
	if err != nil {
		return "", err
	}

	return uploadResult.SecureURL, nil
}
