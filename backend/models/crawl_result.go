package models

type CrawlResult struct {
	ID             uint `gorm:"primaryKey"`
	URL            string
	Title          string
	HTMLVersion    string
	H1Count        int
	H2Count        int
	H3Count        int
	H4Count        int
	H5Count        int
	H6Count        int
	InternalLinks  int
	ExternalLinks  int
	BrokenLinks    int
	HasLoginForm   bool
	BrokenLinkList []BrokenLink `gorm:"foreignKey:CrawlResultID"`
	CreatedAt      int64        `gorm:"autoCreateTime"`
}

type BrokenLink struct {
	ID            uint `gorm:"primaryKey"`
	CrawlResultID uint // Foreign key
	URL           string
	StatusCode    int
}
