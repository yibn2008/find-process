#!/usr/bin/env node

import { program } from 'commander'
import chalk from 'chalk'
import log from 'loglevel'
import find from '../index'
import pkg from '../../package.json'

const logger = log.getLogger('find-process')

let type: string, keyword: string | number = ''

program
  .version(pkg.version)
  .option('-t, --type <type>', 'find process by keyword type (pid|port|name)')
  .option('-p, --port', 'find process by port')
  .arguments('<keyword>')
  .action(function (kw: string) {
    keyword = kw
  })
  .on('--help', () => {
    console.log()
    console.log('  Examples:')
    console.log()
    console.log('    $ find-process node          # find by name "node"')
    console.log('    $ find-process 111           # find by pid "111"')
    console.log('    $ find-process -p 80         # find by port "80"')
    console.log('    $ find-process -t port 80    # find by port "80"')
    console.log()
  })
  .showHelpAfterError()
  .parse(process.argv)

const opts = program.opts()

// check keyword
if (!keyword) {
  console.error(chalk.red('Error: search keyword cannot be empty!'))
  program.outputHelp()
  process.exit(1)
}

// check type
if (opts.port) {
  type = 'port'
} else if (!opts.type) {
  // pid or port
  if (/^\d+$/.test(String(keyword))) {
    type = 'pid'
    keyword = Number(keyword)
  } else {
    type = 'name'
  }
} else {
  type = opts.type
}

logger.debug('find process by: type = %s, keyword = "%s"', type, keyword)

find(type as any, keyword)
  .then((list: any[]) => {
    if (list.length) {
      console.log('Found %s process' + (list.length === 1 ? '' : 'es') + '\n', list.length)

      for (const item of list) {
        console.log(chalk.cyan('[%s]'), item.name || 'unknown')
        console.log('pid: %s', chalk.white(item.pid))
        console.log('cmd: %s', chalk.white(item.cmd))
        console.log()
      }
    } else {
      console.log('No process found')
    }
  }, (err: any) => {
    console.error(chalk.red(err.stack || err))
    process.exit(1)
  }) 