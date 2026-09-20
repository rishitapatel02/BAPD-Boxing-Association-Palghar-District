import os
import mysql.connector
from dotenv import load_dotenv


# Load environment variables
load_dotenv(
    os.path.join(
        os.path.dirname(__file__),
        "..",
        "server",
        ".env"
    )
)


def main():

    print("Connecting to BAPD database...")

    connection = mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        port=int(os.getenv("DB_PORT", "3306")),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
    )

    cursor = connection.cursor(dictionary=True)

    print("Connected to BAPD database.")

    # --------------------------------------------------
    # 1. Get all approved players
    # --------------------------------------------------

    cursor.execute("""
        SELECT
            id,
            full_name,
            weight_category,
            age_group
        FROM players
        WHERE status = 'approved'
        ORDER BY full_name
    """)

    players = cursor.fetchall()

    print(f"Approved players found: {len(players)}")

    # --------------------------------------------------
    # 2. Make sure every approved player exists
    #    in the rankings table
    # --------------------------------------------------

    for player in players:

        cursor.execute("""
            SELECT id
            FROM rankings
            WHERE player_id = ?
        """, (player["id"],))

        existing = cursor.fetchone()

        if not existing:

            cursor.execute("""
                INSERT INTO rankings
                (
                    player_id,
                    weight_category,
                    age_group,
                    points,
                    rank_position
                )
                VALUES (%s, %s, %s, %s, %s)
            """, (
                player["id"],
                player["weight_category"],
                player["age_group"],
                0,
                0
            ))

            print(
                f"Added {player['full_name']} to rankings."
            )

    # --------------------------------------------------
    # 3. Update category and age group information
    # --------------------------------------------------

    for player in players:

        cursor.execute("""
            UPDATE rankings
            SET
                weight_category = %s,
                age_group = %s
            WHERE player_id = %s
        """, (
            player["weight_category"],
            player["age_group"],
            player["id"]
        ))

    connection.commit()

    # --------------------------------------------------
    # 4. Calculate ranking positions
    #    separately for each weight + age group
    # --------------------------------------------------

    cursor.execute("""
        SELECT
            id,
            player_id,
            weight_category,
            age_group,
            points
        FROM rankings
        ORDER BY
            weight_category,
            age_group,
            points DESC
    """)

    rankings = cursor.fetchall()

    current_group = None
    position = 0

    for ranking in rankings:

        group = (
            ranking["weight_category"],
            ranking["age_group"]
        )

        if group != current_group:
            current_group = group
            position = 1
        else:
            position += 1

        cursor.execute("""
            UPDATE rankings
            SET rank_position = %s
            WHERE id = %s
        """, (
            position,
            ranking["id"]
        ))

    connection.commit()

    # --------------------------------------------------
    # 5. Display final rankings
    # --------------------------------------------------

    print("")
    print("BAPD ranking calculation completed.")
    print("")

    cursor.execute("""
        SELECT
            r.rank_position,
            p.full_name,
            r.weight_category,
            r.age_group,
            r.points
        FROM rankings r
        JOIN players p
            ON p.id = r.player_id
        WHERE p.status = 'approved'
        ORDER BY
            r.weight_category,
            r.age_group,
            r.rank_position
    """)

    final_rankings = cursor.fetchall()

    if not final_rankings:
        print("No approved players found.")
    else:

        for ranking in final_rankings:

            print(
                f"{ranking['rank_position']}. "
                f"{ranking['full_name']} | "
                f"{ranking['weight_category']} | "
                f"{ranking['age_group']} | "
                f"{ranking['points']} pts"
            )

    cursor.close()
    connection.close()


if __name__ == "__main__":
    try:
        main()

    except Exception as error:

        print("")
        print("Ranking calculation failed.")
        print(f"Error: {error}")

        raise