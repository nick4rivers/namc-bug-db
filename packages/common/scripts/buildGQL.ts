#!/usr/local/bin/node
import fs from 'fs'
import { print } from 'graphql/language/printer'
import path from 'path'

const inFile = path.join(__dirname, '..', 'dist', 'schema.graphql.js')
const outFile = path.join(__dirname, '..', 'dist', 'schema.gql')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const inImport = require(inFile)

console.log('hello', inFile, outFile)
fs.writeFileSync(outFile, print(inImport.default))
