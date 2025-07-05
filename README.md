# find-process

[![Node.js CI](https://github.com/yibn2008/find-process/actions/workflows/nodejs.yml/badge.svg)](https://github.com/yibn2008/find-process/actions/workflows/nodejs.yml)
[![npm version](https://img.shields.io/npm/v/find-process.svg)](https://www.npmjs.com/package/find-process)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)

With find-process, you can:

- find the process which is listening specified port
- find the process by pid
- find the process by given name or name pattern

We have covered the difference of main OS platform, including **macOS**, **Linux**, **Windows**
and **Android** (with [Termux](https://termux.com)).

## Features

- ✅ **Full TypeScript Support** - Written in TypeScript with complete type definitions
- ✅ **Cross-platform** - Works on macOS, Linux, Windows, and Android
- ✅ **CLI Tool** - Command-line interface for quick process lookup
- ✅ **Node.js API** - Programmatic access with Promise-based API
- ✅ **Modern Build** - ES2020 target with source maps and declaration files

## CLI

Install find-process as a CLI tool:

```sh
$ npm install find-process -g
```

Usage:

```sh

  Usage: find-process [options] <keyword>


  Options:

    -V, --version      output the version number
    -t, --type <type>  find process by keyword type (pid|port|name)
    -p, --port         find process by port
    -h, --help         output usage information

  Examples:

    $ find-process node          # find by name "node"
    $ find-process 111           # find by pid "111"
    $ find-process -p 80         # find by port "80"
    $ find-process -t port 80    # find by port "80"

```

Example:

![image](https://user-images.githubusercontent.com/4136679/62670202-f49a6b00-b9c4-11e9-8692-7003c6c31a8a.png)

## Node API

You can use npm to install:

```sh
$ npm install find-process --save
```

### TypeScript Usage

```typescript
import find, { ProcessInfo, FindConfig } from "find-process";

// Find process by PID
find('pid', 12345)
  .then((list: ProcessInfo[]) => {
    console.log(list);
  })
  .catch((err: Error) => {
    console.log(err.stack || err);
  });

// With configuration options
const config: FindConfig = {
  strict: true,
  logLevel: 'warn'
};

find('name', 'nginx', config)
  .then((list: ProcessInfo[]) => {
    console.log(`Found ${list.length} nginx processes`);
  });
```

### JavaScript Usage

```js
const find = require('find-process');

find('pid', 12345)
  .then(function (list) {
    console.log(list);
  }, function (err) {
    console.log(err.stack || err);
  })
```

## API Reference

### Function Signature

```typescript
function find(type: 'port' | 'pid' | 'name', value: string | number, options?: FindConfig | boolean): Promise<ProcessInfo[]>
```

### Arguments

- `type` - The type of search, supports: `'port' | 'pid' | 'name'`
- `value` - The value to search for. Can be RegExp if type is `'name'`
- `options` - Optional configuration object or boolean for strict mode
  - `options.strict` - Optional strict mode for exact matching of port, pid, or name (on Windows, `.exe` can be omitted)
  - `options.logLevel` - Set logging level to `'trace' | 'debug' | 'info' | 'warn' | 'error'`. Useful for silencing netstat warnings on Linux
  - `options.skipSelf` - Skip the current process when searching by name

### Return Value

Returns a Promise that resolves to an array of process information (`[]` means no processes found):

```typescript
interface ProcessInfo {
  pid: number;           // Process ID
  ppid: number;          // Parent process ID
  uid?: number;          // User ID (Unix systems)
  gid?: number;          // Group ID (Unix systems)
  name: string;          // Command/process name
  bin?: string;          // Executable path (Unix systems)
  cmd: string;           // Full command with arguments
}
```

### Type Definitions

The package includes complete TypeScript definitions:

```typescript
import { ProcessInfo, FindConfig, FindMethod } from 'find-process';
```

## Examples

### Find process listening on port 80

```typescript
import find from 'find-process';

find('port', 80)
  .then((list) => {
    if (!list.length) {
      console.log('Port 80 is free now');
    } else {
      console.log(`${list[0].name} is listening on port 80`);
    }
  });
```

### Find process by PID

```typescript
import find from 'find-process';

find('pid', 12345)
  .then((list) => {
    console.log(list);
  })
  .catch((err) => {
    console.log(err.stack || err);
  });
```

### Find all nginx processes

```typescript
import find from 'find-process';

find('name', 'nginx', true)
  .then((list) => {
    console.log(`There are ${list.length} nginx process(es)`);
  });
```

### Find processes with configuration options

```typescript
import find from 'find-process';

find('name', 'nginx', { strict: true, logLevel: 'error' })
  .then((list) => {
    console.log(`Found ${list.length} nginx process(es)`);
  });
```

### Using async/await

```typescript
import find from 'find-process';

async function findNodeProcesses() {
  try {
    const processes = await find('name', 'node');
    console.log(`Found ${processes.length} Node.js processes`);
    
    processes.forEach(proc => {
      console.log(`PID: ${proc.pid}, Name: ${proc.name}, CMD: ${proc.cmd}`);
    });
  } catch (error) {
    console.error('Error finding processes:', error);
  }
}
```
## Development

### Prerequisites

- Node.js 16+ 
- pnpm (recommended) or npm

### Setup

```bash
# Clone the repository
git clone https://github.com/yibn2008/find-process.git
cd find-process

# Install dependencies
pnpm install

# Build the project
pnpm run build

# Run tests
pnpm test

# Run linting
pnpm run lint
```

### Available Scripts

- `pnpm run build` - Compile TypeScript to JavaScript
- `pnpm run dev` - Watch mode for development
- `pnpm test` - Run tests
- `pnpm run lint` - Run linting and fix issues
- `pnpm run type-check` - TypeScript type checking
- `pnpm run check-version` - Verify version consistency
- `pnpm run update-history` - Update HISTORY.md with recent commits

## Contributing

We welcome Pull Requests for bug fixes and new features. Please check the following before submitting a PR:

- **Coding Style** - Follow the [Standard Style](https://github.com/feross/standard)
- **TypeScript** - Ensure proper typing and no type errors
- **Documentation** - Add documentation for every API change
- **Unit Tests** - Add unit tests for bug fixes or new features
- **Build** - Ensure `pnpm run build` completes successfully

## License

[MIT](LICENSE)

