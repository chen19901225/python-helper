import * as assert from 'assert';
import { get_last_import } from '../../handler/handler_insert_last_import';
// import { get_last_import } from '..../src/handler/handler_insert_last_import';

suite("get_last_import", () => {
    test("import one", () => {
        let line = "from tornado.platform.asyncio import AsyncIOLoop";
        let [flag, import_str] = get_last_import(line);
        assert.equal(flag, true);
        assert.equal(import_str, "AsyncIOLoop")
    })

    test("import one with indent", () => {
        let line = "    from tornado.platform.asyncio import AsyncIOLoop";
        let [flag, import_str] = get_last_import(line);
        assert.equal(flag, true);
        assert.equal(import_str, "AsyncIOLoop")
    })
})