package repository;

import exceptions.DatabaseException;
import exceptions.EmailAlreadyInUse;
import exceptions.UsernameAlreadyInUse;

import javax.sql.DataSource;
import java.sql.*;
import exceptions.InvalidUsernameException;

public class UserRepository {
    DataSource dataSource;

    public UserRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void addUser(String username, String email, String password, String phoneNumber) throws EmailAlreadyInUse, UsernameAlreadyInUse, DatabaseException {
        String addUser = "{call add_user(?,?,?,?)}";
        try(Connection connection = this.dataSource.getConnection();
            CallableStatement stmt = connection.prepareCall(addUser)){

            stmt.setString(1, username);
            stmt.setString(2, email);
            stmt.setString(3, password);
            stmt.setString(4, phoneNumber);

            stmt.execute();

        } catch (SQLException e) {
            System.err.println("SQLException: " + e.getErrorCode());
            if (e.getErrorCode() == 20001) {
                throw new EmailAlreadyInUse(e.getMessage());
            }
            if (e.getErrorCode() == 20002) {
                throw new UsernameAlreadyInUse(e.getMessage());
            }
            else {
                throw new DatabaseException(e.getMessage());
            }
        }
    }

    public String getPasswordForUser(String username) throws SQLException, InvalidUsernameException, SQLIntegrityConstraintViolationException {
        String stmtAsString = "SELECT password_hash FROM users WHERE username = ?";
        try(Connection connection = this.dataSource.getConnection();
            PreparedStatement stmt = connection.prepareStatement(stmtAsString)){
            stmt.setString(1, username);
            ResultSet result = stmt.executeQuery();
            if (!result.next()) {
                throw new InvalidUsernameException("The user with the given username (" + username + ") does not exist");
            }
            else {
                return result.getString(1);
            }
        }
    }
}
