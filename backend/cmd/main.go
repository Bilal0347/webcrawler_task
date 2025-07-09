package main

import (
	"log"
	"url-crawler/internal/server"
)

func main() {
	cfg := server.Config{
		Port:    "8080",
		Timeout: 30,
	}

	srv := server.NewServer(cfg)
	log.Printf("Server starting on :%s", cfg.Port)
	log.Fatal(srv.Start())
}
