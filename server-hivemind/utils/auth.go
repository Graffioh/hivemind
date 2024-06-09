package utils

import (
	"crypto/rand"
	"crypto/subtle"
	"encoding/base32"
	"encoding/base64"
	"errors"
	"fmt"
	"server-hivemind/config"
	"server-hivemind/models"
	"strings"
	"time"

	"golang.org/x/crypto/argon2"
)

type ArgonParams struct {
	version     int
	memory      uint32
	iterations  uint32
	parallelism uint8
	length      uint32
}

func GenerateSessionToken() string {
	bytes := make([]byte, 15)
	rand.Read(bytes)
	sessionId := base32.StdEncoding.EncodeToString(bytes)
	return sessionId
}

func ValidateSession(session_id string) (*models.Session, error) {
	db := config.GetDB()

	var session models.Session

	err := db.QueryRow("SELECT token, expires_at, user_id FROM sessions WHERE token = $1;", session_id).Scan(&session.Token, &session.ExpiresAt, &session.UserID)
	if err != nil {
		return nil, errors.New("invalid session id")
	}

	exp_date := time.Now().AddDate(0, 0, session.ExpiresAt)
	if time.Now().After(exp_date) {
		return nil, errors.New("expired session")
	}

	return &session, nil
}

func generateSalt(n int) ([]byte, error) {
	s := make([]byte, n)
	_, err := rand.Read(s)
	if err != nil {
		return nil, err
	}
	return s, nil
}

func HashPassword(pw string) (string, error) {
	var p ArgonParams = ArgonParams{
		version:     19,
		memory:      19 * 1024,
		iterations:  2,
		parallelism: 1,
		length:      32,
	}

	salt, err := generateSalt(16)
	if err != nil {
		return "", err
	}

	hash := argon2.IDKey([]byte(pw), salt, p.iterations, p.memory, p.parallelism, p.length)

	b64s := base64.RawStdEncoding.EncodeToString(salt)
	b64h := base64.RawStdEncoding.EncodeToString(hash)

	eh := fmt.Sprintf("$argon2id$v=%d$m=%d,t=%d,p=%d$%s$%s", p.version, p.memory, p.iterations, p.parallelism, b64s, b64h)

	return eh, nil
}

func CheckPasswords(pw string, stored_hash_pw string) (bool, error) {
	p, salt, stored_hash, err := decodeHash(stored_hash_pw)
	if err != nil {
		return false, err
	}

	new_hash := argon2.IDKey([]byte(pw), salt, p.iterations, p.memory, p.parallelism, p.length)

	if subtle.ConstantTimeCompare(stored_hash, new_hash) == 1 {
		return true, nil
	}
	return false, nil
}

func decodeHash(encoded_hash string) (p *ArgonParams, salt, hash []byte, err error) {
	vals := strings.Split(encoded_hash, "$")
	if len(vals) != 6 {
		return nil, nil, nil, errors.New("the encoded hash is not in the correct format")
	}

	var version int
	_, err = fmt.Sscanf(vals[2], "v=%d", &version)
	if err != nil {
		return nil, nil, nil, err
	}
	if version != argon2.Version {
		return nil, nil, nil, errors.New("incompatible version of argon2")
	}

	p = &ArgonParams{}
	_, err = fmt.Sscanf(vals[3], "m=%d,t=%d,p=%d", &p.memory, &p.iterations, &p.parallelism)
	if err != nil {
		return nil, nil, nil, err
	}

	salt, err = base64.RawStdEncoding.Strict().DecodeString(vals[4])
	if err != nil {
		return nil, nil, nil, err
	}

	hash, err = base64.RawStdEncoding.Strict().DecodeString(vals[5])
	if err != nil {
		return nil, nil, nil, err
	}
	p.length = uint32(len(hash))

	return p, salt, hash, nil
}
