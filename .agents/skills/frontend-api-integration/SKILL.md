---
name: frontend-api-integration
description: Integrate a frontend API using verified local contracts, with the sibling backend repository treated strictly as read-only reference material.
---

# Frontend API integration

Use whenever adding or changing an API call, its types, authentication handling, or API-backed UI state. Read `AGENTS.md`, frontend API code, and available frontend API documentation first.

## Verify the contract before coding

1. Reuse or inspect existing frontend API clients, types, and error handling.
2. Check frontend API specifications or documentation.
3. If still needed, locate the expected sibling backend repository at `../bookjeokbookjeok-backend` from the frontend repository. Treat it only as a read-only reference.
4. Inspect the relevant Controller, request DTO, response DTO, authentication configuration, and endpoint implementation.
5. Verify method, path, path/query parameters, request body, successful response, error response, status codes, pagination shape, and token behavior before defining frontend types or storage behavior.

Never infer backend field names, request bodies, response fields, status codes, membership flags, pagination, or access/refresh-token storage. Do not present a mock as the real contract.

## Backend boundary

Never create, edit, move, format, test, install dependencies in, stage, commit, push, or switch branches in the backend repository. Do not alter backend skills, `AGENTS.md`, or `.docs`.

If the sibling repository or required contract is unavailable or ambiguous, state what could not be verified. Stop at a clearly marked TODO or an interface boundary rather than fabricating an integration. Do not search unrelated backend repositories as substitutes.
