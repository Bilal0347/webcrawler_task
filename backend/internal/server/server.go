package server

import (
	"url-crawler/internal/handlers"

	"github.com/gin-gonic/gin"
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

	s := &Server{
		router: r,
		config: cfg,
	}

	s.setupRoutes()
	s.setupMiddleware()
	return s
}

func (s *Server) setupRoutes() {
	crawlHandler := handlers.NewCrawlHandler(s.config.Timeout)
	s.router.POST("/crawl", crawlHandler.HandleCrawlRequest)

	// Health check endpoint
	s.router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})
}

func (s *Server) setupMiddleware() {
	s.router.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})
}

func (s *Server) Start() error {
	return s.router.Run(":" + s.config.Port)
}
