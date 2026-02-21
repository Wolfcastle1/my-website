package dao

import (
	"context"
	"log"

	"backend/internal/models"
	"github.com/jackc/pgx/v5/pgxpool"
)

var pool *pgxpool.Pool

func ConnectDB(connectionString string) {

	p, err := pgxpool.New(context.Background(), connectionString) 
	if err != nil {
		log.Fatalf("Unable to connect to database %v\n", err)
	}

	if err := p.Ping(context.Background()); err != nil {
		log.Fatalf("Cannot reach database %v\n", err)
	} 

	log.Println("Connected to database")
	pool = p
}

func Close() {
	pool.Close()
}

func IncrementUserTokens(email string) int {
	var tokens int
	err := pool.QueryRow(context.Background(),
		"UPDATE users SET tokens = tokens + 1 WHERE email = $1 RETURNING tokens",
		email,
	).Scan(&tokens)
	if err != nil {
		log.Fatalf("Failed to increment tokens for %s: %v\n", email, err)
	}
	return tokens
}

func GetUserData(email string) models.User {
	var user models.User
	err := pool.QueryRow(context.Background(),
		"SELECT email, tokens FROM users WHERE email = $1",
		email,
	).Scan(&user.Email, &user.Tokens)
	if err != nil {
		log.Fatalf("Failed to get user %s: %v\n", email, err)
	}
	return user
}







