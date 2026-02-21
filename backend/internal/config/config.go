package config

import (
		"log"
		"os"
		"github.com/joho/godotenv"
)

type Config struct {
	DatabaseUrl string 
}

func Load() Config {

	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	return Config {
		DatabaseUrl: os.Getenv("DB_URL"),
	}
	
}