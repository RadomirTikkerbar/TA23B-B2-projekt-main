create database website_intdatabase;
use website_intdatabase;

create table user_information (
userID BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
accountname varchar(255) unique not null,
payment_data varchar(255),
type ENUM('Standard', 'Premium') NOT NULL DEFAULT 'Standard',
IP_address varchar(255)
);

create table movie (
movies varchar(45) not null primary key, 
name_movie varchar(60),
availability varchar(10),
ticket_price decimal(10),
age_rating varchar(3),
screening_time time default null,
genre varchar(30),
movie_lang varchar (20)
);

CREATE TABLE theater (
  theaters BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  movieidmovie BIGINT UNSIGNED NOT NULL,
  unq_code VARCHAR(8) NOT NULL,
  description_theater VARCHAR(45) DEFAULT NULL,
  CONSTRAINT fk_theater_movie FOREIGN KEY (movieidmovie) REFERENCES movie(idmovie)
);

CREATE TABLE screening (
  idscreen INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  movie_movies VARCHAR(45) NOT NULL,
  theater_theaters BIGINT UNSIGNED NOT NULL,
  starttime DATETIME NOT NULL,
  endtime DATETIME NOT NULL,
  CONSTRAINT chk_screen_time CHECK (starttime < endtime),
  CONSTRAINT fk_screen_movie FOREIGN KEY (movie_movies) REFERENCES movie(movies),
  CONSTRAINT fk_screen_theater FOREIGN KEY (theater_theaters) REFERENCES theater(theater)
);

CREATE TABLE ticket (
  idticket INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  price DECIMAL(8,2) NOT NULL,
  user_iduser BIGINT UNSIGNED NOT NULL,
  screen_idscreen INT UNSIGNED NOT NULL,
  koht_kohtid BIGINT UNSIGNED NOT NULL,
  CONSTRAINT fk_ticket_user FOREIGN KEY (user_iduser) REFERENCES users(iduser),
  CONSTRAINT fk_ticket_screen FOREIGN KEY (screen_idscreen) REFERENCES screen(idscreen),
  CONSTRAINT fk_ticket_seat FOREIGN KEY (seat_seats) REFERENCES seat(idseat),
  UNIQUE KEY uniq_ticket_screen_seat (screen_idscreen, seat_seats)
);

