/*
  @name removeIntegrationProviderQuery
*/
WITH removedTokens AS (
  UPDATE "IntegrationToken"
  SET "isActive" = FALSE, "updatedAt" = CURRENT_TIMESTAMP
  WHERE "integrationProviderId" = :id AND "isActive" = TRUE
)
UPDATE "IntegrationProvider"
SET "isActive" = FALSE, "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" = :id AND "isActive" = TRUE;