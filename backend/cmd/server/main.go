package main

import (
	"log"
	"os"
	"url-crawler/internal/db"
	"url-crawler/internal/server"
)

func main() {
	db.LoadEnvVariables()
	db.InitDatabase()

	cfg := server.Config{
		Port:    os.Getenv("PORT"),
		Timeout: 30,
	}

	srv := server.NewServer(cfg)
	log.Printf("Server starting on :%s", cfg.Port)
	log.Fatal(srv.Start())
}
