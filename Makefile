.PHONY: setup dev test test-e2e size-check lint typecheck build check release

setup:
	npm install

dev:
	npm run dev

test:
	npm run test

test-e2e:
	npm run test:e2e

size-check:
	npm run size:check

lint:
	npm run lint

typecheck:
	npm run typecheck

build:
	npm run build

check:
	npm run check

release:
	npm run build
