package main

import (
	"fmt"
	"net/http"
)

func main() {
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "Backend is up and running!")
	})
	fmt.Println("Server running at http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}
