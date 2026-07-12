DOMAIN = quiz.pharmacievaldoise.selys.app
EMAIL = karimadio40@gmail.com
COMPOSE = docker compose

.PHONY: help build up down restart logs seed ssl-init ssl-renew deploy clean

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

logs-quiz: ## Show quiz app logs
	$(COMPOSE) logs -f quiz

seed: ## Seed the database with default quizzes
	$(COMPOSE) exec quiz node dist/seed.js

ssl-init: ## First-time SSL certificate setup
	cp nginx/init.conf nginx/default.conf.bak
	cp nginx/init.conf nginx/default.conf
	$(COMPOSE) up -d nginx
	$(COMPOSE) run --rm certbot certonly --webroot --webroot-path=/var/www/certbot --email $(EMAIL) --agree-tos --no-eff-email -d $(DOMAIN)
	cp nginx/default.conf.bak nginx/default.conf
	rm nginx/default.conf.bak
	$(COMPOSE) restart nginx

ssl-renew: ## Renew SSL certificate
	$(COMPOSE) run --rm certbot renew
	$(COMPOSE) restart nginx

deploy: build up ## Build and deploy
	@echo "Deployed to https://$(DOMAIN)"

clean: ## Remove containers, volumes, and images
	$(COMPOSE) down -v --rmi local
