SERVICENAME=sandbox
# аналог $PWD
CUR_DIR=$(CURDIR)
BACK_PORTS=5050:5000
# получить текущую версию приложения
VERSION=$(shell npm run --silent version:get)

NETWORK_NAME=$(SERVICENAME)_crud_docker
LOCAL_CONTAINER_NAME=$(SERVICENAME)_crud
LOCAL_IMAGE_NAME=$(SERVICENAME):crud

# развернуть приложение первый раз
expand: network_create app_build app_expand up

up: postgres app_up test_db_create app_start # запустить приложение
down: app_down stop_services # остановить приложение

# обновить версию приложения
version_change:
	npm run --silent version:change

# собрать контейнер для локальной разработки
app_build:
	docker build -t $(LOCAL_IMAGE_NAME) - < local.Dockerfile

# запустить приложение только для установки актуальных пакетов из package-lock.json
app_expand:
	docker run --rm \
		-it \
		-v $(CUR_DIR):/usr/src/app \
		$(LOCAL_IMAGE_NAME) npm ci

# запустить приложение как демон
app_up:
	docker run --rm --name $(LOCAL_CONTAINER_NAME) \
		-it \
		-p $(BACK_PORTS) \
		-v $(CUR_DIR):/usr/src/app \
		--network $(NETWORK_NAME) \
		--env-file ./deployment/local.env \
		-d $(LOCAL_IMAGE_NAME) || true

# открыть запущенный контейнер с приложением
app_open:
	docker exec -it $(LOCAL_CONTAINER_NAME) /bin/bash

# запустить приложение в контейнере
app_start:
	docker exec -it $(LOCAL_CONTAINER_NAME) /bin/bash -c "npm start"

# остановить приложение, даже если остановлено
app_down:
	docker stop $(LOCAL_CONTAINER_NAME) || true

# сеть docker для приложения
network_create:
	docker network create $(NETWORK_NAME) || true

# сопустсвующее ПО
postgres:
	docker rm $(SERVICENAME)_pg_docker || true
	docker run --rm --name $(SERVICENAME)_pg_docker \
		--network $(NETWORK_NAME) \
		-e POSTGRES_USER=developer -e POSTGRES_PASSWORD=developer -e POSTGRES_DB=$(SERVICENAME)_local \
		-p 5432:5432 \
		-d postgres:11.4 || true
		@# ждём поддержку 12й версии в typeorm
		@# https://github.com/typeorm/typeorm/issues/4332
		@# https://github.com/typeorm/typeorm/issues/4573

test_db_create:
	docker exec -it $(SERVICENAME)_pg_docker \
		/bin/bash -c "createdb $(SERVICENAME)_test -O developer -U developer" || true

stop_services:
	docker stop $(SERVICENAME)_pg_docker || true

# тесты
test:
	docker exec -it $(LOCAL_CONTAINER_NAME) /bin/bash -c "npm run test"
