package repository;

import exceptions.DatabaseException;
import exceptions.InvalidResetTokenException;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class TokenRepository {
    DataSource dataSource;

    public TokenRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void saveResetToken(String token) throws DatabaseException {
        String stmtAsString = "INSERT INTO reset_token (token_data) VALUES (?)";
        try(Connection connection = this.dataSource.getConnection();
            PreparedStatement stmt = connection.prepareStatement(stmtAsString)){

            stmt.setString(1, token);

            int rowsAffected = stmt.executeUpdate();

            if (rowsAffected < 1) {
                throw new DatabaseException("Error inserting reset token");
            }
        } catch (SQLException e) {
            throw new DatabaseException(e);
        }
    }

    public void verifyResetTokenExistence(Connection conn, String token) throws SQLException, InvalidResetTokenException {
        String stmtAsString = "SELECT 1 FROM reset_token WHERE token_data = ?";
        PreparedStatement stmt = conn.prepareStatement(stmtAsString);
        stmt.setString(1, token);
        ResultSet rs = stmt.executeQuery();
        if (!rs.next()) {
            throw new InvalidResetTokenException("Error inserting reset token");
        }
    }
}
