package storage

import (
	"context"
	"fmt"
	"mime/multipart"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/misbahul-alam/cartify-platform/infra/config"
)

type cloudinaryStorage struct {
	client *cloudinary.Cloudinary
	folder string
}

func NewCloudinaryStorage(cfg *config.Config) (Storage, error) {
	cld, err := cloudinary.NewFromParams(cfg.Cloudinary.CloudName, cfg.Cloudinary.APIKey, cfg.Cloudinary.APISecret)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize cloudinary: %w", err)
	}

	return &cloudinaryStorage{
		client: cld,
		folder: cfg.Cloudinary.Folder,
	}, nil
}

func (s *cloudinaryStorage) UploadFile(ctx context.Context, fileHeader *multipart.FileHeader, folder string) (string, string, error) {
	file, err := fileHeader.Open()
	if err != nil {
		return "", "", fmt.Errorf("failed to open file: %w", err)
	}
	defer file.Close()

	uploadFolder := s.folder
	if folder != "" {
		uploadFolder = fmt.Sprintf("%s/%s", s.folder, folder)
	}

	uploadResult, err := s.client.Upload.Upload(ctx, file, uploader.UploadParams{
		Folder: uploadFolder,
	})
	if err != nil {
		return "", "", fmt.Errorf("failed to upload to cloudinary: %w", err)
	}

	return uploadResult.SecureURL, uploadResult.PublicID, nil
}

func (s *cloudinaryStorage) DeleteFile(ctx context.Context, publicID string) error {
	_, err := s.client.Upload.Destroy(ctx, uploader.DestroyParams{
		PublicID: publicID,
	})
	if err != nil {
		return fmt.Errorf("failed to delete from cloudinary: %w", err)
	}

	return nil
}
