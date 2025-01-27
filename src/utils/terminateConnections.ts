import { MikroORM } from "@mikro-orm/core";

export const terminateIdleConnections = async (
  orm: MikroORM
): Promise<void> => {
  const query = `
    WITH inactive_connections AS (
        SELECT
            pid,
            rank() OVER (PARTITION BY client_addr ORDER BY backend_start ASC) AS rank
        FROM 
            pg_stat_activity
        WHERE
            pid <> pg_backend_pid()  -- Exclude current session
        AND
            application_name !~ '(?:psql)|(?:pgAdmin.+)'  -- Exclude known applications
        AND
            datname = current_database()  -- Same database
        AND
            usename = current_user  -- Same user
        AND
            state IN ('idle', 'idle in transaction', 'idle in transaction (aborted)', 'disabled')  -- Inactive states
        AND
            current_timestamp - state_change > INTERVAL '5 seconds'  -- Old connections
    )
    SELECT
        pg_terminate_backend(pid)
    FROM
        inactive_connections 
    WHERE
        rank > 1;  -- Leave one connection per client
  `;

  try {
    const em = orm.em.fork(); // Use a forked EntityManager for raw queries
    await em.getConnection().execute(query);
    console.log("Idle connections terminated successfully.");
  } catch (error: any) {
    console.error("Failed to terminate idle connections:", error.message);
  }
};
