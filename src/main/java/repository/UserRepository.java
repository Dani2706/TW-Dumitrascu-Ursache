package repository;

import oracle.jdbc.OracleTypes;

import javax.sql.DataSource;
import java.sql.*;
import exceptions.InvalidUsernameException;

public class UserRepository {
    DataSource dataSource;

    public UserRepository() {}

    public String addUser(DataSource dataSource, String username, String email, String password) throws SQLException {
        String addUser = "{? = call add_user(?,?,?)}";
        try(Connection connection = dataSource.getConnection();
            CallableStatement stmt = connection.prepareCall(addUser)){

            stmt.registerOutParameter(1, OracleTypes.VARCHAR);

            stmt.setString(2, username);
            stmt.setString(3, email);
            stmt.setString(4, password);

            stmt.execute();

            return stmt.getString(1);
        }
    }

    public String getPasswordForUser(DataSource dataSource, String username) throws SQLException, InvalidUsernameException, SQLIntegrityConstraintViolationException {
        String stmtAsString = "SELECT password FROM users WHERE username = ?";
        try(Connection connection = dataSource.getConnection();
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
