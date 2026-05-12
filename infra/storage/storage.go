package storage

import (
	"context"
	"mime/multipart"
)

type Storage interface {
	UploadFile(ctx context.Context, file *multipart.FileHeader, folder string) (string, string, error)
	DeleteFile(ctx context.Context, publicID string) error
}
