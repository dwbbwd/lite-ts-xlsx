import { IParser, ParserFactoryBase } from 'lite-ts-parser';
import { read, utils, WorkSheet } from 'xlsx';
import lodash from 'lodash';

import { IEnumFactory } from './i-enum-factory';
import { ISheetParseOption, SheetParser } from './sheet-parser';

export interface IProgressBar {
    hide(): void;
    show(): void;
}

export class DomParser implements IParser {
    private m_SheetParser: IParser;
    protected get sheetParser() {
        this.m_SheetParser ??= new SheetParser(this.m_EnumFactory, this.m_ParserFactory);
        return this.m_SheetParser;
    }

    public constructor(
        private m_EnumFactory: IEnumFactory,
        private m_ProgressBar: IProgressBar,
        private m_ParserFactory: ParserFactoryBase,
    ) { }

    public async parse(domSelector: string) {
        this.m_ProgressBar?.show();

        const el = document.querySelector(domSelector) as any;
        return new Promise((s, f) => {
            const reject = f;
            f = arg => {
                this.m_ProgressBar?.hide();
                reject(arg);
            };

            const file = el.files[0];
            const ext = file.name.split('.').pop();
            if (ext !== 'xlsx' && ext !== 'xls')
                return f('只能选择excel文件导入');

            const result = {};
            const reader = new FileReader();
            reader.onload = async e => {
                const data = e.target.result;
                const excel = read(data, {
                    type: 'binary',
                });
                for (const r of excel.SheetNames) {
                    excel.Sheets[r]['!ref'] = this.getSheetRange(excel.Sheets[r]);
                    result[r] = await this.sheetParser.parse({
                        rows: utils.sheet_to_json(excel.Sheets[r]),
                        sheetName: r,
                    } as ISheetParseOption);
                }

                el.value = null;
                s(result);
            };
            reader.onerror = () => {
                el.value = null;
                f('转义错误');
            };
            reader.readAsBinaryString(file);
        });
    }

    /**
     * 获取 sheet 实际范围
     * 
     * @param sheet 
     */
    private getSheetRange(sheet: WorkSheet) {
        const sheetWithValues = lodash.pickBy(sheet, r => !!r.v);
        const cellNames = lodash.keys(sheetWithValues);
        const cellAddreses = cellNames.map(r => utils.decode_cell(r));
        const maxRow = lodash.max(cellAddreses.map(r => r.r));
        const maxCell = lodash.max(cellAddreses.map(r => r.c));
        const lastCell = utils.encode_cell({ c: maxCell, r: maxRow });
        return `A1:${lastCell}`;
    }
}