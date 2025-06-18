package repository;

import dto.UserDTO;
import exceptions.*;

import javax.sql.DataSource;
import java.sql.*;

public class UserRepository {
    DataSource dataSource;

    public UserRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void addUser(String username, String email, String password, String phoneNumber) throws EmailAlreadyInUseException, UsernameAlreadyInUseException, PhoneNumberAlreadyInUseException, DatabaseException {
        String addUser = "{call add_user(?,?,?,?)}";
        try(Connection connection = this.dataSource.getConnection();
            CallableStatement stmt = connection.prepareCall(addUser)){

            stmt.setString(1, username);
            stmt.setString(2, email);
            stmt.setString(3, password);
            stmt.setString(4, phoneNumber);

            stmt.execute();

        } catch (SQLException e) {
            if (e.getErrorCode() == 20001) {
                throw new EmailAlreadyInUseException(e.getMessage());
            }
            else if (e.getErrorCode() == 20002) {
                throw new UsernameAlreadyInUseException(e.getMessage());
            }
            else if (e.getErrorCode() == 20004) {
                throw new PhoneNumberAlreadyInUseException(e.getMessage());
            }
            else {
                throw new DatabaseException(e.getMessage());
            }
        }
    }

    public String getPasswordForUser(String username) throws SQLException, InvalidUsernameException {
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

    public UserDTO getUserDataByUsername(String username) throws DatabaseException, InvalidUsernameException {
        String stmtAsString = "SELECT username, email, phone_number FROM users WHERE username = ?";
        try(Connection connection = this.dataSource.getConnection();
            PreparedStatement stmt = connection.prepareStatement(stmtAsString)){

            stmt.setString(1, username);
            ResultSet result = stmt.executeQuery();

            if (!result.next()) {
                throw new InvalidUsernameException("The user with the given username (" + username + ") does not exist");
            }
            else {
                return new UserDTO(result.getString(1), result.getString(2), result.getString(3));
            }
        } catch (SQLException e) {
            throw new DatabaseException(e);
        }
    }
}
