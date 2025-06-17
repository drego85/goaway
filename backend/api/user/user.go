package user

import (
	"database/sql"
	"errors"
	"goaway/backend/logging"
	"strings"

	"golang.org/x/crypto/bcrypt"
)

var log = logging.GetLogger()

type Credentials struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func (user *User) Create(db *sql.DB) error {
	hashedPassword, err := hashPassword(user.Password)
	if err != nil {
		log.Error("Failed to hash password: %v", err)
		return err
	}

	query := "INSERT INTO user (username, password) VALUES (?, ?)"

	tx, err := db.Begin()
	if err != nil {
		log.Error("Could not start transaction: %v", err)
		return err
	}
	defer func(tx *sql.Tx) {
		_ = tx.Rollback()
	}(tx)

	if _, err := tx.Exec(query, user.Username, hashedPassword); err != nil {
		log.Error("Insert failed: %v", err)
		return err
	}

	return tx.Commit()
}

func hashPassword(password string) (string, error) {
	hashed, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(hashed), err
}

func (user *User) Exists(db *sql.DB) bool {
	query := "SELECT 1 FROM user WHERE username = ? LIMIT 1"
	var exists int
	if err := db.QueryRow(query, user.Username).Scan(&exists); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return false
		}
		log.Error("Query error: %v", err)
		return false
	}
	return true
}

func (user *User) Authenticate(db *sql.DB) bool {
	query := "SELECT password FROM user WHERE username = ?"

	var hashedPassword string
	if err := db.QueryRow(query, user.Username).Scan(&hashedPassword); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			log.Error("User not found: %s", user.Username)
			return false
		}
		log.Error("Query error: %v", err)
		return false
	}

	if err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(user.Password)); err != nil {
		return false
	}

	return true
}

func (user *User) UpdatePassword(db *sql.DB) error {
	hashedPassword, err := hashPassword(user.Password)
	if err != nil {
		log.Error("Failed to hash new password: %v", err)
		return err
	}

	query := "UPDATE user SET password = ? WHERE username = ?"
	tx, err := db.Begin()
	if err != nil {
		log.Error("Could not start transaction: %v", err)
		return err
	}
	defer func(tx *sql.Tx) {
		_ = tx.Rollback()
	}(tx)

	if _, err := tx.Exec(query, hashedPassword, user.Username); err != nil {
		log.Error("Password update failed: %v", err)
		return err
	}

	return tx.Commit()
}

func (c *Credentials) Validate() error {
	c.Username = strings.TrimSpace(c.Username)
	c.Password = strings.TrimSpace(c.Password)

	if c.Username == "" || c.Password == "" {
		return errors.New("username and password cannot be empty")
	}

	if len(c.Username) > 60 {
		return errors.New("username too long")
	}
	if len(c.Password) > 120 {
		return errors.New("password too long")
	}

	for _, r := range c.Username {
		if r < 32 || r == 127 {
			return errors.New("username contains invalid characters")
		}
	}

	return nil
}
