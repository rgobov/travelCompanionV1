# Travel Companion

Приложение для создания и просмотра туристических экскурсий, разработанное на Java Spring Boot.

## Технологии

- Java 17
- Spring Boot 3.2.3
- Spring Security
- Spring Data JPA
- PostgreSQL
- Flyway (миграции базы данных)
- Lombok
- SpringDoc OpenAPI (Swagger) для документации API

## Требования

- JDK 17+
- Maven 3.6+
- PostgreSQL 12+

## Настройка базы данных

1. Создайте базу данных PostgreSQL с именем `travelcompanion`:

```sql
CREATE DATABASE travelcompanion;
```

2. Настройте пользователя и пароль в `application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/travelcompanion
spring.datasource.username=postgres
spring.datasource.password=postgres
```

## Запуск приложения

### Из командной строки

```bash
mvn spring-boot:run
```

Приложение запустится на порту 5000 (настроено в `application.properties`).

### Из IDE

Запустите класс `TravelCompanionApplication.java` как Java-приложение.

## Документация API

После запуска приложения документация API будет доступна по URL:

```
http://localhost:5000/swagger-ui/index.html
```

## Основные функции

- Регистрация и аутентификация пользователей
- Создание, просмотр, редактирование и удаление туров
- Управление точками интереса внутри тура
- Загрузка и получение медиа-файлов (фото, аудио, видео)

## Структура проекта

- `model`: Классы сущностей JPA (User, Tour, PointOfInterest)
- `dto`: Data Transfer Objects для передачи данных между слоями
- `repository`: JPA-репозитории для доступа к данным
- `service`: Бизнес-логика приложения
- `controller`: REST-контроллеры для API-эндпоинтов
- `config`: Конфигурационные классы
- `exception`: Обработка исключений

## Примеры API-запросов

### Регистрация пользователя

```
POST /api/users/register
Content-Type: application/json

{
  "username": "user",
  "password": "password"
}
```

### Создание тура

```
POST /api/tours
Content-Type: application/json
Authorization: Basic dXNlcjpwYXNzd29yZA==

{
  "name": "Тур по Петербургу",
  "location": "Санкт-Петербург",
  "description": "Экскурсия по центру Санкт-Петербурга",
  "createdById": 1
}
```

### Добавление точки интереса

```
POST /api/tours/1/points
Content-Type: application/json
Authorization: Basic dXNlcjpwYXNzd29yZA==

{
  "name": "Эрмитаж",
  "description": "Государственный Эрмитаж - один из крупнейших музеев мира",
  "latitude": "59.9398",
  "longitude": "30.3146",
  "order": 1
}
``` 