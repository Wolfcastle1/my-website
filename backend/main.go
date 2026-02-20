package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func main() {
	r := chi.NewRouter()
	r.Use(middleware.Logger)

	r.Get("/{User}", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"message": buildJSON(chi.URLParam(r, "User"))})
	})

	log.Println("Server starting on port 8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}

func buildJSON(Name string) string {
	return "Hello " + Name;
}


