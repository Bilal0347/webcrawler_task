package config

import "time"

type Config struct {
	ServerPort string
	Timeout    time.Duration
}

func Load() *Config {
	return &Config{
		ServerPort: "8080",
		Timeout:    30 * time.Second,
	}
}
