package crawler

import (
	"net/url"
	"strings"
	"time"
	"url-crawler/pkg/httputil"

	"github.com/PuerkitoBio/goquery"
)

type Analyzer struct {
	httpClient *httputil.Client
}

func NewAnalyzer(timeout time.Duration) *Analyzer {
	return &Analyzer{
		httpClient: httputil.NewClient(timeout),
	}
}

func (a *Analyzer) Analyze(doc *goquery.Document, baseURL *url.URL, result *CrawlResult) {
	result.Title = a.extractTitle(doc)
	result.HTMLVersion = a.extractHTMLVersion(doc)
	a.countHeadings(doc, result)
	result.HasLoginForm = a.detectLoginForm(doc)
	a.analyzeLinks(doc, baseURL, result)
}

func (a *Analyzer) extractTitle(doc *goquery.Document) string {
	title := doc.Find("title").Text()
	if title == "" {
		return "No title found"
	}
	return strings.TrimSpace(title)
}

func (a *Analyzer) extractHTMLVersion(doc *goquery.Document) string {
	html, _ := doc.Html()
	if strings.Contains(strings.ToLower(html), "<!doctype html>") {
		return "HTML5"
	}
	return "HTML4 or earlier"
}

func (a *Analyzer) countHeadings(doc *goquery.Document, result *CrawlResult) {
	result.H1Count = doc.Find("h1").Length()
	result.H2Count = doc.Find("h2").Length()
	result.H3Count = doc.Find("h3").Length()
	result.H4Count = doc.Find("h4").Length()
	result.H5Count = doc.Find("h5").Length()
	result.H6Count = doc.Find("h6").Length()
}

func (a *Analyzer) detectLoginForm(doc *goquery.Document) bool {
	patterns := []string{
		"input[type='password']",
		"input[name*='password']",
		"input[id*='password']",
		"form[action*='login']",
		"form[id*='login']",
	}

	for _, pattern := range patterns {
		if doc.Find(pattern).Length() > 0 {
			return true
		}
	}
	return false
}

func (a *Analyzer) analyzeLinks(doc *goquery.Document, baseURL *url.URL, result *CrawlResult) {
	doc.Find("a[href]").Each(func(_ int, s *goquery.Selection) {
		href, exists := s.Attr("href")
		if !exists {
			return
		}

		// Skip special links
		if strings.HasPrefix(href, "#") ||
			strings.HasPrefix(href, "mailto:") ||
			strings.HasPrefix(href, "javascript:") {
			return
		}

		linkURL, err := url.Parse(href)
		if err != nil {
			return
		}

		resolvedURL := baseURL.ResolveReference(linkURL)

		if resolvedURL.Host == baseURL.Host {
			result.InternalLinks++
		} else {
			result.ExternalLinks++
		}

		if statusCode, isBroken := a.httpClient.CheckLink(resolvedURL.String()); isBroken {
			result.BrokenLinks++
			result.BrokenLinkList = append(result.BrokenLinkList, BrokenLink{
				URL:        resolvedURL.String(),
				StatusCode: statusCode,
			})
		}
	})
}
