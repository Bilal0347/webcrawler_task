package server

import (
	"url-crawler/internal/api"

	"github.com/gin-gonic/gin"
	"github.com/gin-contrib/cors"
)

type Config struct {
	Port    string
	Timeout int
}

type Server struct {
	router *gin.Engine
	config Config
}

func NewServer(cfg Config) *Server {
	gin.SetMode(gin.ReleaseMode)
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://127.0.0.1:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Content-Type"},
		AllowCredentials: true,
	}))

	s := &Server{
		router: r,
		config: cfg,
	}

	s.setupRoutes()
	return s
}

func (s *Server) setupRoutes() {
	crawlHandler := api.NewCrawlHandler(s.config.Timeout)
	
	// URL Management APIs
	s.router.POST("/urls", crawlHandler.AddURLToDB)                    // Add URL to DB
	s.router.POST("/urls/crawl", crawlHandler.RunCrawler)              // Run crawler for URL
	s.router.GET("/urls", crawlHandler.GetCrawlResults)                // Get all URLs
	s.router.DELETE("/urls/:id", crawlHandler.DeleteURL)               // Delete single URL
	s.router.DELETE("/urls", crawlHandler.DeleteMultipleURLs)          // Delete multiple URLs
	
	// Legacy APIs (for backward compatibility)
	s.router.POST("/crawl", crawlHandler.HandleCrawlRequest)
	s.router.GET("/crawl", crawlHandler.GetCrawlResults)

	// Health check endpoint
	s.router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})
}

func (s *Server) Start() error {
	return s.router.Run(":" + s.config.Port)
}
