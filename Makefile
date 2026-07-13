DOMAIN = quiz.pharmacievaldoise.selys.app
EMAIL = karimadio40@gmail.com
COMPOSE = docker compose
NGINX_CONF = /etc/nginx/sites-available/$(DOMAIN)
NGINX_ENABLED = /etc/nginx/sites-enabled/$(DOMAIN)

.PHONY: help build up down restart logs seed ssl-init ssl-renew deploy clean nginx-init nginx-setup

help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

build: ## Build Docker images
	$(COMPOSE) build

up: ## Start all services
	$(COMPOSE) up -d

down: ## Stop all services
	$(COMPOSE) down

restart: ## Restart all services
	$(COMPOSE) down
	$(COMPOSE) up -d

logs: ## Show logs (follow mode)
	$(COMPOSE) logs -f

seed: ## Seed the database with default quizzes
	$(COMPOSE) exec quiz node dist/seed.js

nginx-init: ## First-time nginx + SSL setup
	cp nginx/init.conf $(NGINX_CONF)
	ln -sf $(NGINX_CONF) $(NGINX_ENABLED)
	nginx -t && systemctl reload nginx
	certbot certonly --webroot --webroot-path=/var/www/certbot --email $(EMAIL) --agree-tos --no-eff-email -d $(DOMAIN)
	cp nginx/default.conf $(NGINX_CONF)
	nginx -t && systemctl reload nginx

nginx-setup: ## Copy nginx config (after SSL already exists)
	cp nginx/default.conf $(NGINX_CONF)
	ln -sf $(NGINX_CONF) $(NGINX_ENABLED)
	nginx -t && systemctl reload nginx

ssl-renew: ## Renew SSL certificate
	certbot renew
	systemctl reload nginx

deploy: build up nginx-setup ## Build, deploy, and configure nginx
	@echo "Deployed to https://$(DOMAIN)"

clean: ## Remove containers, volumes, and images
	$(COMPOSE) down -v --rmi local
