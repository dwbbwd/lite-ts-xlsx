# ![Version](https://img.shields.io/badge/version-1.8.3-green.svg)

## install

```
npm install lite-ts-parser
npm install lite-ts-xlsx
```

## use

```
import { ParserFactory, ParserType } from 'lite-ts-parser';
import { DomParser } from 'lite-ts-xlsx';

const parserFactory = new ParserFactory(enumFactory, {}, {});
const rows = await new DomParser(enumFactory, progressBar, parserFactory).parse('#id');
// rows = { columns:[{ ... }, ...], rows:[{ ... }, ...]}

const rows = await new FileParser(enumFactory, parserFactory).parse('./test.xlsx');
// rows = { columns:[{ ... }, ...], rows:[{ ... }, ...]}
```