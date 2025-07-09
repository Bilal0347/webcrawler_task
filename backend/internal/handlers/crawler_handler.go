package handlers

import (
	"net/http"
	"time"

	"url-crawler/internal/crawler"

	"github.com/gin-gonic/gin"
)

type CrawlHandler struct {
	crawler *crawler.Crawler
	timeout time.Duration
}

func NewCrawlHandler(timeoutSec int) *CrawlHandler {
	return &CrawlHandler{
		crawler: crawler.NewCrawler(time.Duration(timeoutSec) * time.Second),
		timeout: time.Duration(timeoutSec) * time.Second,
	}
}

type CrawlRequest struct {
	URL string `json:"url" binding:"required"`
}

func (h *CrawlHandler) HandleCrawlRequest(c *gin.Context) {
	var req CrawlRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request format",
			"details": err.Error(),
		})
		return
	}

	result, err := h.crawler.Crawl(req.URL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to crawl URL",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, result)
}
