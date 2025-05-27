import oracle.jdbc.OracleTypes;

import javax.sql.DataSource;
import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.SQLException;

public class UserRepository {
    DataSource dataSource;
    private final String addUser = "{? = call addUser(?,?,?,?)}";

    UserRepository() {}

    public String addUser(DataSource dataSource, int id, String username, String email, String password) throws SQLException {
        try(Connection connection = dataSource.getConnection();
            CallableStatement stmt = connection.prepareCall(addUser)){

            stmt.registerOutParameter(1, OracleTypes.VARCHAR);

            stmt.setInt(2, id);
            stmt.setString(3, username);
            stmt.setString(4, email);
            stmt.setString(5, password);

            stmt.execute();

            return stmt.getString(1);
        }
    }
}
