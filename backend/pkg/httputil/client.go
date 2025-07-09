package httputil

import (
	"net/http"
	"time"
)

type Client struct {
	client  *http.Client
	timeout time.Duration
}

func NewClient(timeout time.Duration) *Client {
	return &Client{
		client: &http.Client{
			Timeout: timeout,
			CheckRedirect: func(req *http.Request, via []*http.Request) error {
				return http.ErrUseLastResponse
			},
		},
		timeout: timeout,
	}
}

func (c *Client) Get(url string) (*http.Response, error) {
	return c.client.Get(url)
}

func (c *Client) CheckLink(url string) (int, bool) {
	resp, err := c.client.Head(url)
	if err != nil {
		return 0, true
	}
	defer resp.Body.Close()

	return resp.StatusCode, resp.StatusCode >= 400
}
