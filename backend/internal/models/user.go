package models

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type User struct {
	ID        string    `json:"id"`
	ClerkID   string    `json:"clerk_id"`
	Email     string    `json:"email"`
	Name      string    `json:"name,omitempty"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type UserRepository struct {
	db *pgxpool.Pool
}

func NewUserRepository(db *pgxpool.Pool) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) CreateOrUpdate(ctx context.Context, clerkID, email, name string) (*User, error) {
	query := `
		INSERT INTO users (clerk_id, email, name)
		VALUES ($1, $2, $3)
		ON CONFLICT (clerk_id) DO UPDATE SET
			email = EXCLUDED.email,
			name = COALESCE(NULLIF(EXCLUDED.name, ''), users.name),
			updated_at = NOW()
		RETURNING id, clerk_id, email, name, created_at, updated_at
	`

	var user User
	err := r.db.QueryRow(ctx, query, clerkID, email, name).Scan(
		&user.ID,
		&user.ClerkID,
		&user.Email,
		&user.Name,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *UserRepository) GetByClerkID(ctx context.Context, clerkID string) (*User, error) {
	query := `
		SELECT id, clerk_id, email, name, created_at, updated_at
		FROM users
		WHERE clerk_id = $1
	`

	var user User
	err := r.db.QueryRow(ctx, query, clerkID).Scan(
		&user.ID,
		&user.ClerkID,
		&user.Email,
		&user.Name,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *UserRepository) Update(ctx context.Context, clerkID string, name string) (*User, error) {
	query := `
		UPDATE users
		SET name = $2, updated_at = NOW()
		WHERE clerk_id = $1
		RETURNING id, clerk_id, email, name, created_at, updated_at
	`

	var user User
	err := r.db.QueryRow(ctx, query, clerkID, name).Scan(
		&user.ID,
		&user.ClerkID,
		&user.Email,
		&user.Name,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &user, nil
}
