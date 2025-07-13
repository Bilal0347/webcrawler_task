package api

import (
	"net/http"
	"strconv"
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

type AddURLRequest struct {
	URL string `json:"url" binding:"required"`
}

// AddURLToDB adds a URL to the database without crawling
func (h *CrawlHandler) AddURLToDB(c *gin.Context) {
	var req AddURLRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request format",
			"details": err.Error(),
		})
		return
	}

	// Check if URL already exists
	var existingResult models.CrawlResult
	if err := db.DB.Where("url = ?", req.URL).First(&existingResult).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{
			"error": "URL already exists in database",
		})
		return
	}

	// Create new crawl result with pending status
	dbResult := models.CrawlResult{
		URL:           req.URL,
		Title:         "Pending crawl...",
		HTMLVersion:   "",
		H1Count:       0,
		H2Count:       0,
		H3Count:       0,
		H4Count:       0,
		H5Count:       0,
		H6Count:       0,
		InternalLinks: 0,
		ExternalLinks: 0,
		BrokenLinks:   0,
		HasLoginForm:  false,
		Status:        "queued",
	}

	if err := db.DB.Create(&dbResult).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to add URL to database",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, dbResult)
}

// RunCrawler crawls a specific URL and updates the database
func (h *CrawlHandler) RunCrawler(c *gin.Context) {
	var req CrawlRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request format",
			"details": err.Error(),
		})
		return
	}

	// Find the URL in database
	var dbResult models.CrawlResult
	if err := db.DB.Where("url = ?", req.URL).First(&dbResult).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "URL not found in database",
		})
		return
	}

	// Update status to running
	db.DB.Model(&dbResult).Update("status", "running")

	// Crawl the URL
	result, err := h.crawler.Crawl(req.URL)
	if err != nil {
		// Update status to error
		db.DB.Model(&dbResult).Update("status", "error")
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to crawl URL",
			"details": err.Error(),
		})
		return
	}

	// Update the database with crawl results
	updates := map[string]interface{}{
		"title":          result.Title,
		"html_version":   result.HTMLVersion,
		"h1_count":       result.H1Count,
		"h2_count":       result.H2Count,
		"h3_count":       result.H3Count,
		"h4_count":       result.H4Count,
		"h5_count":       result.H5Count,
		"h6_count":       result.H6Count,
		"internal_links": result.InternalLinks,
		"external_links": result.ExternalLinks,
		"broken_links":   result.BrokenLinks,
		"has_login_form": result.HasLoginForm,
		"status":         "completed",
	}

	if err := db.DB.Model(&dbResult).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to update crawl result",
			"details": err.Error(),
		})
		return
	}

	// Clear existing broken links and add new ones
	db.DB.Where("crawl_result_id = ?", dbResult.ID).Delete(&models.BrokenLink{})
	
	for _, bl := range result.BrokenLinkList {
		brokenLink := models.BrokenLink{
			CrawlResultID: dbResult.ID,
			URL:           bl.URL,
			StatusCode:    bl.StatusCode,
		}
		db.DB.Create(&brokenLink)
	}

	c.JSON(http.StatusOK, result)
}

// DeleteURL deletes a URL and all its associated data
func (h *CrawlHandler) DeleteURL(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid ID format",
		})
		return
	}

	// Delete broken links first
	if err := db.DB.Where("crawl_result_id = ?", id).Delete(&models.BrokenLink{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to delete broken links",
			"details": err.Error(),
		})
		return
	}

	// Delete the crawl result
	if err := db.DB.Delete(&models.CrawlResult{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to delete URL",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "URL and associated data deleted successfully",
	})
}

// DeleteMultipleURLs deletes multiple URLs and their associated data
func (h *CrawlHandler) DeleteMultipleURLs(c *gin.Context) {
	var req struct {
		IDs []uint `json:"ids" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request format",
			"details": err.Error(),
		})
		return
	}

	// Delete broken links first
	if err := db.DB.Where("crawl_result_id IN ?", req.IDs).Delete(&models.BrokenLink{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to delete broken links",
			"details": err.Error(),
		})
		return
	}

	// Delete the crawl results
	if err := db.DB.Delete(&models.CrawlResult{}, req.IDs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to delete URLs",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "URLs and associated data deleted successfully",
	})
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
		Status:        "completed",
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
	if err := db.DB.Preload("BrokenLinkList").Order("created_at DESC").Find(&results).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to fetch crawl results",
			"details": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, results)
}
