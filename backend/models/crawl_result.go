package models

type CrawlResult struct {
	ID             uint `gorm:"primaryKey" json:"id"`
	URL            string `json:"url"`
	Title          string `json:"title"`
	HTMLVersion    string `json:"htmlVersion"`
	H1Count        int `json:"h1Count"`
	H2Count        int `json:"h2Count"`
	H3Count        int `json:"h3Count"`
	H4Count        int `json:"h4Count"`
	H5Count        int `json:"h5Count"`
	H6Count        int `json:"h6Count"`
	InternalLinks  int `json:"internalLinks"`
	ExternalLinks  int `json:"externalLinks"`
	BrokenLinks    int `json:"brokenLinks"`
	HasLoginForm   bool `json:"hasLoginForm"`
	Status         string `gorm:"default:'queued'" json:"status"` // queued, running, completed, error
	BrokenLinkList []BrokenLink `gorm:"foreignKey:CrawlResultID" json:"brokenLinkList"`
	CreatedAt      int64 `gorm:"autoCreateTime" json:"createdAt"`
}

type BrokenLink struct {
	ID            uint `gorm:"primaryKey" json:"id"`
	CrawlResultID uint `json:"crawlResultId"` // Foreign key
	URL           string `json:"url"`
	StatusCode    int `json:"statusCode"`
}
