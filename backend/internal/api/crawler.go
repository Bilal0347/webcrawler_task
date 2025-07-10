package api

import (
	"net/http"
	"time"
	"url-crawler/internal/crawler"
	"url-crawler/models"

	"github.com/gin-gonic/gin"
	"url-crawler/internal/db"
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

	// Map crawler.CrawlResult to models.CrawlResult
	dbResult := models.CrawlResult{
		URL:           result.URL,
		Title:         result.Title,
		HTMLVersion:   result.HTMLVersion,
		H1Count:       result.H1Count,
		H2Count:       result.H2Count,
		H3Count:       result.H3Count,
		H4Count:       result.H4Count,
		H5Count:       result.H5Count,
		H6Count:       result.H6Count,
		InternalLinks: result.InternalLinks,
		ExternalLinks: result.ExternalLinks,
		BrokenLinks:   result.BrokenLinks,
		HasLoginForm:  result.HasLoginForm,
	}
	for _, bl := range result.BrokenLinkList {
		dbResult.BrokenLinkList = append(dbResult.BrokenLinkList, models.BrokenLink{
			URL:        bl.URL,
			StatusCode: bl.StatusCode,
		})
	}

	if err := db.DB.Create(&dbResult).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to save crawl result",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, result)
}

func (h *CrawlHandler) GetCrawlResults(c *gin.Context) {
	var results []models.CrawlResult
	if err := db.DB.Preload("BrokenLinkList").Find(&results).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to fetch crawl results",
			"details": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, results)
}
