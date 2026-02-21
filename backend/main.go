package main

import (
	"encoding/json"

	"log"
	"net/http"

	"backend/internal/config"
	"backend/internal/dao"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)



func main() {

	cfg := config.Load()
	dao.ConnectDB(cfg.DatabaseUrl)
	defer dao.Close()

	r := chi.NewRouter()
	r.Use(middleware.Logger)

	r.Put("/{email}", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		incrementEmailTokens(chi.URLParam(r, "email"))
		json.NewEncoder(w).Encode(map[string]string{})
	})

	r.Get("/{email}", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		user := dao.GetUserData(chi.URLParam(r, "email"))
		json.NewEncoder(w).Encode(user)
	})

	log.Println("Server starting on port 8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}

// Returns the updated number of tokens for a user
func incrementEmailTokens(email string) int {
	return dao.IncrementUserTokens(email)
}

func buildJSON(Name string) string {
	return "Hello " + Name;
}



