const bcrypt = require("bcryptjs");
const CustomError = require("../errors");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");

class User {
  constructor(db) {
    this.db = db;
  }

  async initTable() {
    const tableExists = await this.db.schema.hasTable("users");

    if (!tableExists) {
      await this.db.schema.createTable("users", (table) => {
        table.increments("id").primary();
        table
          .string("name", 50)
          .notNullable()
          .checkLength(">=", 3)
          .checkLength("<=", 50);
        table.string("email").notNullable().unique();
        table.check('email LIKE "%@%.%"'); // SQLite compatible pattern matching
        table.string("password").notNullable().checkLength(">=", 6);
      });
    }
  }

  async createUser({ name, email, password }) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [id] = await this.db("users")
      .insert({
        name,
        email,
        password: hashedPassword,
      })
      .returning("id"); // SQLite returns id automatically
    return { id, name, email, hashedPassword };
  }

  async findByEmail(email) {
    const user = await this.db("users").where("email", email).first();
    return user;
  }

  async comparePassword(candidatePassword, userPassword) {
    const isMatch = await bcrypt.compare(candidatePassword, userPassword);
    return isMatch;
  }

  createJWT(user) {
    return jwt.sign(
      { userId: user.id, name: user.name },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );
  }
}

module.exports = User;

/*

    class User {
        constructor(db) {
            this.db = db;
        }

        async initTable() {
            // await this.db.exec('PRAGMA foreign_keys = ON;'); // to force FOREIGN_KEY Enforcement
            await this.db.exec(`
                CREATE TABLE IF NOT EXISTS users(
                    id INTEGER PRIMARY KEY,
                    name STRING NOT NULL CHECK(length(name) >= 3 AND length(name) <= 50),
                    email STRING NOT NULL UNIQUE CHECK(email LIKE '%@%.%'),
                    password STRING NOT NULL CHECK(length(password) >= 6)
                )
                `);
        }

        async createUser({ name, email, password }) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const { lastID } = await this.db.run(
                'INSERT INTO users (name, email, password) VALUES (?,?,?)',
                [name, email, hashedPassword]
            );
            return { id: lastID, name, email, hashedPassword };
        }

        async findByEmail(email) {
            const user = await this.db.get(
            'SELECT * FROM users WHERE email = ?', 
            [email]
            );
            return user;
        }

        async comparePassword(candidatePassword, userPassword) {
            const isMatch = await bcrypt.compare(candidatePassword, userPassword);
            return isMatch;
        }

        createJWT(user) {
            return jwt.sign({ userId: user.id, name: user.name }, process.env.JWT_SECRET, {
                    expiresIn: '30d'
                })
        }
    }

*/
