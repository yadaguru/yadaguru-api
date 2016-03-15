-- Keeps track of users
create table users(
    id bigint primary key not null unique DEFAULT id_generator(),
    phone_number char(10) not null unique,
    created_at timestamptz DEFAULT current_timestamp,
    phone_number_validation_token char(6) default random_value(6),
    personal_login_token char(6),
    reset_password_token_set_at timestamptz,
    search tsvector,
    signin_count int
);

CREATE TRIGGER users_search_vector_refresh
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW EXECUTE PROCEDURE
tsvector_update_trigger(search, 'pg_catalog.english',  phone_number);
