class Job {
  constructor(db) {
    this.db = db;
  }

  async initTable() {
    const tableExists = await this.db.schema.hasTable("jobs");

    if (!tableExists) {
      await this.db.schema.createTable("jobs", (table) => {
        table.increments("id").primary();
        table.string("role").notNullable().checkLength("<=", 100);
        table.string("company").notNullable().checkLength("<=", 50);
        table
          .enum("status", ["pending", "interview", "decline"])
          .notNullable()
          .defaultTo("pending");
        table
          .integer("created_by")
          .notNullable()
          .references("id")
          .inTable("users")
          .onDelete("CASCADE");
        table.timestamp("created_at").defaultTo(this.db.fn.now());
        table.timestamp("updated_at").defaultTo(this.db.fn.now());
      });
    }
  }

  async createJob({ role, company, status, createdBy }) {
    const [id] = await this.db("jobs").insert({
      role,
      company,
      status,
      created_by: createdBy,
    });
    return { id, role, company, status, createdBy };
  }

  async getAllJobs({ userId }) {
    return this.db("jobs")
      .select("jobs.*", "users.name as creator_name")
      .join("users", "jobs.created_by", "users.id")
      .where("created_by", userId);
  }

  async getSingleJob({ jobId, userId }) {
    return this.db("jobs").where({ id: jobId, created_by: userId }).first();
  }

  async updateJob({ jobId, userId }, payload) {
    // 1. Only allow specific fields to be updated
    const updates = {
      // Note 1
      ...(payload.role && { role: payload.role }), // Only add if truthy
      ...(payload.company && { company: payload.company }),
      ...(payload.status && { status: payload.status }),
      updated_at: this.db.raw("CURRENT_TIMESTAMP"),
    };

    // 2. Update the job (if owned by userId) and return it
    const [updatedJob] = await this.db("jobs")
      .where({ id: jobId, created_by: userId })
      .update(updates)
      .returning("*"); // Returns the updated row

    return updatedJob;
  }

  async deleteJob({ jobId, userId }) {
    const count = await this.db("jobs")
      .where({ id: jobId, created_by: userId })
      .del(); // .del() is Knex's DELETE method

    return count; // Number of rows deleted (0 or 1)
  }
}

module.exports = Job;

/*
	NOTES

	Note 1

		Using the spread operator in that way equates to:

			if ('role' in payload) updates.role = payload.role;
			if ('company' in payload) updates.company = payload.company;
			if ('status' in payload) updates.status = payload.status;
*/

/*

	class Job {
		constructor (db) {
			this.db = db;
		}

		async initTable() {
			await this.db.exec('PRAGMA foreign_keys = ON;'); // to force FOREIGN_KEY Enforcement
			await this.db.exec(`
				CREATE TABLE IF NOT EXISTS jobs (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					role TEXT NOT NULL CHECK(length(role) <= 100),
					company TEXT NOT NULL CHECK(length(company) <= 50),
					status TEXT NOT NULL CHECK(status IN ('interview', 'pending', 'declined')) DEFAULT 'pending',
					created_by INTEGER NOT NULL,
					created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
					updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
					FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
			)
			`);
		}

		async createJob({ role, company, status, createdBy }) {
			const { lastID } = await this.db.run(
			`INSERT INTO jobs (role, company, status, created_by)
			VALUES (?, ?, ?, ?)`,
			[role, company, status, createdBy]
			);
			return { id: lastID, role, company, status, createdBy };
		}

		async getAllJobs({ userId }) {	// gets all the jobs that were created by the user only
			return this.db.all(		// no need to use await here because we return the promise and it is 
									// awaited by in the controller, so it resolves there and we return 
									// whatever this.db.all() resolves to   
				`SELECT jobs.*, users.name AS creator_name 
				FROM jobs
				INNER JOIN users ON jobs.created_by = users.id
				WHERE jobs.created_by = ?`,
				[userId]
			);
		}

		async getSingleJob({ jobId, userId }) {
			return this.db.get(
				`SELECT * FROM jobs WHERE id= ? AND created_by = ?`,
				[jobId, userId]
			);
		}

		async updateJob({ jobId, userId }, payload) {
			const allowedFields = ['role', 'company', 'status'];
			const keys = Object.keys(payload).filter((key) => allowedFields.includes(key))
			const values = keys.map((key) => payload[key]);

			let setClause = 'updated_at = CURRENT_TIMESTAMP';
			if (keys.length) {
				setClause += ', '
				setClause += keys.map((key) => `${key} = ?`).join(', ');
			}

			const query = `UPDATE jobs SET ${setClause} WHERE id = ? AND created_by = ? RETURNING *`;
			const result = await this.db.get(query, ...values, jobId, userId);
			return result;
		}

		async deleteJob ({ jobId, userId }) {
			const { changes } = await this.db.run(
				`DELETE FROM jobs WHERE id = ? AND created_by = ?`,
				[jobId, userId]
			);

			return changes;
		}
	}
*/
