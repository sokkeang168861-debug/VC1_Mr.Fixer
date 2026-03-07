class Admin {
  static query(db, sql, params = []) {
    return new Promise((resolve, reject) => {
      db.query(sql, params, (err, results) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(results);
      });
    });
  }

  static async getUserStats(db, options = {}) {
    const year = Number(options.year) || new Date().getFullYear();
    const userStatsRows = await this.query(
      db,
      `SELECT
         COUNT(*) AS totalUsers,
         SUM(CASE WHEN LOWER(role) = 'fixer' THEN 1 ELSE 0 END) AS totalFixers,
         SUM(CASE WHEN LOWER(role) = 'customer' THEN 1 ELSE 0 END) AS totalCustomers
       FROM users`
    );

    const jobsMeta = await this.getJobsTableMeta(db);
    const totalJobs = await this.getTotalJobsCount(db, jobsMeta);
    const monthlyJobs = await this.getMonthlyJobsByYear(db, jobsMeta, year);
    const userStats = userStatsRows[0] || {};

    return {
      totalUsers: Number(userStats.totalUsers || 0),
      totalFixers: Number(userStats.totalFixers || 0),
      totalCustomers: Number(userStats.totalCustomers || 0),
      totalJobs,
      monthlyJobs,
      year,
    };
  }

  static async getJobsTableMeta(db) {
    const dbRows = await this.query(db, "SELECT DATABASE() AS dbName");
    const dbName = dbRows[0]?.dbName;

    if (!dbName) {
      return null;
    }

    const tableRows = await this.query(
      db,
       `SELECT table_name AS tableName
       FROM information_schema.tables
       WHERE table_schema = ?
         AND table_name IN ('bookings', 'booking', 'jobs', 'job')
       ORDER BY FIELD(table_name, 'bookings', 'booking', 'jobs', 'job')
       LIMIT 1`,
      [dbName]
    );

    if (!tableRows.length) {
      return null;
    }

    const tableName = tableRows[0].tableName;
    const columnRows = await this.query(
      db,
      `SELECT column_name AS columnName
       FROM information_schema.columns
       WHERE table_schema = ? AND table_name = ?`,
      [dbName, tableName]
    );

    const columnsMap = new Map(
      columnRows.map((col) => [String(col.columnName).toLowerCase(), col.columnName])
    );

    const dateColumn =
      columnsMap.get("created_at") ||
      columnsMap.get("scheduled_at") ||
      columnsMap.get("booking_date") ||
      columnsMap.get("booked_at") ||
      columnsMap.get("date");

    const statusColumn =
      columnsMap.get("status") ||
      columnsMap.get("booking_status") ||
      columnsMap.get("state");

    const rejectedByColumn =
      columnsMap.get("rejected_by") ||
      columnsMap.get("rejectedby");

    return { tableName, dateColumn, statusColumn, rejectedByColumn };
  }

  static buildNotRejectedWhere(statusColumn, rejectedByColumn) {
    const conditions = [];

    if (!statusColumn) {
      conditions.push("1=1");
    } else {
      conditions.push(`(\`${statusColumn}\` IS NULL OR LOWER(\`${statusColumn}\`) NOT IN ('rejected', 'reject'))`);
    }

    if (rejectedByColumn) {
      conditions.push(`\`${rejectedByColumn}\` IS NULL`);
    }

    return conditions.join(" AND ");
  }

  static async getTotalJobsCount(db, jobsMeta) {
    if (!jobsMeta?.tableName) {
      return 0;
    }

    const whereClause = this.buildNotRejectedWhere(jobsMeta.statusColumn, jobsMeta.rejectedByColumn);
    const countRows = await this.query(
      db,
      `SELECT COUNT(*) AS totalJobs
       FROM \`${jobsMeta.tableName}\`
       WHERE ${whereClause}`
    );

    return Number(countRows[0]?.totalJobs || 0);
  }

  static async getMonthlyJobsByYear(db, jobsMeta, year) {
    const emptyMonthly = new Array(12).fill(0);

    if (!jobsMeta?.tableName || !jobsMeta.dateColumn) {
      return emptyMonthly;
    }

    const whereClause = this.buildNotRejectedWhere(jobsMeta.statusColumn, jobsMeta.rejectedByColumn);
    const rows = await this.query(
      db,
      `SELECT MONTH(\`${jobsMeta.dateColumn}\`) AS monthNumber, COUNT(*) AS total
       FROM \`${jobsMeta.tableName}\`
       WHERE YEAR(\`${jobsMeta.dateColumn}\`) = ?
         AND ${whereClause}
       GROUP BY MONTH(\`${jobsMeta.dateColumn}\`)`,
      [year]
    );

    for (const row of rows) {
      const monthIndex = Number(row.monthNumber) - 1;
      if (monthIndex >= 0 && monthIndex < 12) {
        emptyMonthly[monthIndex] = Number(row.total || 0);
      }
    }

    return emptyMonthly;
  }
}

module.exports = Admin;
