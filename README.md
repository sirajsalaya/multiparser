# multipartbody

[![npm version](https://img.shields.io/npm/v/multipartbody)](https://www.npmjs.com/package/multipartbody)
[![CI](https://github.com/sirajsalaya/multi-parser/actions/workflows/ci.yml/badge.svg)](https://github.com/sirajsalaya/multi-parser/actions/workflows/ci.yml)
[![npm downloads](https://img.shields.io/npm/dm/multipartbody)](https://www.npmjs.com/package/multipartbody)

Multer-like Express multipart middleware that parses `multipart/form-data` and stores uploaded files directly in `req.body`.

`multipartbody` is built for nested form-data payloads where files belong inside arrays and objects, not on separate `req.file` or `req.files` properties.

## Why not Multer?

Multer is excellent when `req.file` and `req.files` fit your request shape.

`multipartbody` is for cases like:

- forms that submit nested arrays of records
- files that belong alongside sibling metadata in `req.body`
- APIs where you want one merged request payload instead of splitting text fields and files

Example target shape:

```json
[
  {
    "id": "1",
    "name": "john",
    "docs": [
      {
        "id": "1",
        "file": {
          "originalname": "photo.jpg"
        }
      }
    ]
  }
]
```

## Install

```bash
npm install multipartbody
```

Peer dependency:

- `express` (`^4.21.0 || ^5.2.1`)

## Quick Start

```ts
import express from 'express';
import multipartBody from 'multipartbody';

const app = express();

app.post('/upload', multipartBody(), (req, res) => {
  res.json(req.body);
});
```

## Common Use Cases

### Nested object payloads

```bash
curl --location 'http://localhost:3000/upload' \
  --form 'profile.name=alice' \
  --form 'profile.avatar=@"/path/to/avatar.png"'
```

### Array of records with files

```bash
curl --location 'http://localhost:3000/upload' \
  --form '[0].id=1' \
  --form '[0].name=john' \
  --form '[0].docs[0].id=1' \
  --form '[0].docs[0].file=@"/path/to/photo-1.jpg"' \
  --form '[1].id=2' \
  --form '[1].name=doe' \
  --form '[1].docs[0].id=2' \
  --form '[1].docs[0].file=@"/path/to/photo-2.jpg"'
```

### Filter by MIME type

```ts
import multipartBody from 'multipartbody';

app.post(
  '/upload',
  multipartBody({
    allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
  }),
  (req, res) => {
    res.json(req.body);
  },
);
```

## Full Options

```ts
import express from 'express';
import multipartBody, { memoryStorage, type MultipartBodyOptions } from 'multipartbody';

const app = express();

const uploadOptions: MultipartBodyOptions = {
  storage: memoryStorage(),
  preservePath: false,
  defParamCharset: 'latin1',
  allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
  limits: {
    fieldNameSize: 100,
    fieldSize: 1024 * 1024,
    fields: 100,
    fileSize: 10 * 1024 * 1024,
    files: 20,
    parts: 120,
    headerPairs: 2000,
  },
};

app.post('/upload', multipartBody(uploadOptions), (req, res) => {
  res.json(req.body);
});
```

## Multer Migration

Multer:

```ts
import multer from 'multer';

app.post('/upload', multer().single('avatar'), (req, res) => {
  res.json({
    body: req.body,
    file: req.file,
  });
});
```

`multipartbody`:

```ts
import multipartBody from 'multipartbody';

app.post('/upload', multipartBody(), (req, res) => {
  res.json(req.body);
});
```

If your form field is `profile.avatar`, the parsed file is available at `req.body.profile.avatar`.

## Common Gotchas

### Import style

If your TypeScript setup auto-imports namespace style (`import * as x from 'multipartbody'`), change it to one of these callable imports:

```ts
import multipartBody from 'multipartbody';
// or
import { multipartBody } from 'multipartbody';
```

### Top-level array syntax

To build a root array in `req.body`, use indexed root fields such as:

```bash
--form '[0].id=1'
--form '[0].docs[0].file=@"/path/to/file.jpg"'
```

### Repeated indexed record blocks

If you send repeated indexed blocks like `person[0][id]`, `person[0][name]`, `person[0][docs][0][file]` in record order, `multipartbody` rolls them into sibling records instead of merging values into arrays on a single object.

## API

### `multipartBody(options?)`

Returns Express middleware.

Options:

- `storage?: StorageEngine` default `memoryStorage()`
- `limits?: MultipartBodyLimits`
- `allowedMimeTypes?: string[]`
- `fileFilter?: (req, file, cb) => void`
- `preservePath?: boolean`
- `defParamCharset?: string` default `latin1`

### `MultipartBodyLimits`

- `fieldNameSize?: number`
- `fieldSize?: number`
- `fields?: number`
- `fileSize?: number`
- `files?: number`
- `parts?: number`
- `headerPairs?: number`

### `memoryStorage()`

Built-in storage engine that buffers file content in memory.

### `MulterError`

Error class with Multer-style codes:

- `LIMIT_PART_COUNT`
- `LIMIT_FILE_SIZE`
- `LIMIT_FILE_COUNT`
- `LIMIT_FIELD_KEY`
- `LIMIT_FIELD_VALUE`
- `LIMIT_FIELD_COUNT`
- `LIMIT_UNEXPECTED_FILE`
- `MISSING_FIELD_NAME`

## Examples

- Minimal Express example: [examples/basic-express.ts](./examples/basic-express.ts)
- Multer migration example: [examples/multer-migration.ts](./examples/multer-migration.ts)

## Published Artifacts

The npm package includes:

- `dist/`
- `README.md`
- `LICENSE`
- `examples/`

Use `npm run pack:check` to verify package contents before publish.

## Development

```bash
npm install
npm run check
```

Commands:

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run pack:check`

## Git Hook Standards

This project uses Husky with fast local checks:

- `pre-commit`: runs `lint-staged` on staged files only
- `commit-msg`: validates Conventional Commits via `commitlint`
- `pre-push`: runs tests (`npm run test -- --bail`)

After cloning, run:

```bash
npm install
```

The `prepare` script installs hooks automatically.
