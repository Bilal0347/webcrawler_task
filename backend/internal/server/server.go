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
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "OPTIONS"},
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
