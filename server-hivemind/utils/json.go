package utils

import (
	"encoding/json"
	"io"
)

func ToJSON(w io.Writer, i interface{}) error {
	e := json.NewEncoder(w)

	return e.Encode(i)
}

func FromJSON(r io.Reader, i interface{}) error {
	d := json.NewDecoder(r)
	return d.Decode(i)
}
