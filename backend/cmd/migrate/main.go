package main

import (
	"url-crawler/internal/db"
	"url-crawler/models"
)

func init() {
	db.LoadEnvVariables()
	db.InitDatabase()
}

func main() {
	db.DB.AutoMigrate(&models.CrawlResult{}, &models.BrokenLink{})
}
