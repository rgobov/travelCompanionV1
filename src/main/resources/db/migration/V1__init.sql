-- Создание таблицы пользователей
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- Создание таблицы туров
CREATE TABLE tours (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT,
    created_by_id BIGINT REFERENCES users(id)
);

-- Создание таблицы точек интереса
CREATE TABLE points_of_interest (
    id BIGSERIAL PRIMARY KEY,
    tour_id BIGINT NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    latitude VARCHAR(50) NOT NULL,
    longitude VARCHAR(50) NOT NULL,
    photo_filename VARCHAR(255),
    audio_filename VARCHAR(255),
    video_filename VARCHAR(255),
    "order" INTEGER
); 