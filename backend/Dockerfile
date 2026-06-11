FROM php:8.3-fpm

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    curl \
    git \
    zip \
    unzip \
    default-mysql-client \
    && docker-php-ext-install pdo pdo_mysql \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .

RUN composer install --no-interaction --optimize-autoloader

RUN mkdir -p storage/framework/{cache,sessions,views} && chmod -R 777 storage

EXPOSE 8000

CMD php artisan serve --host=0.0.0.0 --port=8000
