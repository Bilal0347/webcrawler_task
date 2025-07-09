package crawler

import (
	"net/url"
	"time"
	"url-crawler/pkg/httputil"

	"github.com/PuerkitoBio/goquery"
)

type Crawler struct {
	httpClient *httputil.Client
	analyzer   *Analyzer
}

func NewCrawler(timeout time.Duration) *Crawler {
	return &Crawler{
		httpClient: httputil.NewClient(timeout),
		analyzer:   NewAnalyzer(timeout),
	}
}

func (c *Crawler) Crawl(targetURL string) (*CrawlResult, error) {
	doc, baseURL, err := c.fetchAndParse(targetURL)
	if err != nil {
		return nil, err
	}

	result := &CrawlResult{URL: targetURL}
	c.analyzer.Analyze(doc, baseURL, result)
	return result, nil
}

func (c *Crawler) fetchAndParse(targetURL string) (*goquery.Document, *url.URL, error) {
	resp, err := c.httpClient.Get(targetURL)
	if err != nil {
		return nil, nil, err
	}
	defer resp.Body.Close()

	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		return nil, nil, err
	}

	baseURL, _ := url.Parse(targetURL)
	return doc, baseURL, nil
}
