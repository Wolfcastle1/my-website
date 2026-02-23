package config

import (
		"log"
		"os"
		"github.com/joho/godotenv"
)

type Config struct {
	DatabaseUrl string 
	CLerkPublicKey string
	ClerkPrivateKey string
}

func Load() Config {

	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	return Config {
		DatabaseUrl: os.Getenv("DB_URL"),
		CLerkPublicKey: os.Getenv("CLERK_PUBLIC_KEY"),
		ClerkPrivateKey: os.Getenv("CLERK_PRIVATE_KEY"),
	}
	
}