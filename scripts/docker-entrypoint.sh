#!/bin/sh
set -e

REQUIRED_VARS="POSTGRES_URL QDRANT_URL"
MISSING_VARS=""

# Check for missing required environment variables
for VAR in $REQUIRED_VARS; do
  if [ -z "$(eval echo \$$VAR)" ]; then
    MISSING_VARS="$MISSING_VARS $VAR"
  fi
done

if [ -n "$MISSING_VARS" ]; then
  echo "Error: The following required environment variables are missing:"
  for VAR in $MISSING_VARS; do
    echo "  - $VAR"
  done
  echo "Please provide them when running the container."
  exit 1
fi

# Validate POSTGRES_URL
case "$POSTGRES_URL" in
  postgresql://*|postgres://*) ;;
  *)
    echo "Error: POSTGRES_URL must start with 'postgresql://' or 'postgres://'"
    echo "Current value: $POSTGRES_URL"
    exit 1
    ;;
esac

# Generate AUTH_SECRET if not provided
if [ -z "$AUTH_SECRET" ]; then
  echo "Warning: AUTH_SECRET not provided. Generatng a random secret..."
  GENERATED_SECRET=$(od -vN "32" -An -tx1 /dev/urandom | tr -d " \n")
  export AUTH_SECRET="$GENERATED_SECRET"
  echo "Generated AUTH_SECRET: $AUTH_SECRET"
  echo "Note: If you restart this container without persistence, sessions may be invalidated."
fi

# Run database migrations
echo "Runnng database migrations..."
if npx tsx scripts/migrate.ts; then
    echo "Database migrations completed."
else
    echo "Database migrations failed. Exiting."
    exit 1
fi

exec "$@"
